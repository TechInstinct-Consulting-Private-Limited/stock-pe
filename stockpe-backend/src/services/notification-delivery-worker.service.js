const pool = require("../config/database");
const { getExpoReceipts, isPushEnabled, sendExpoPush } = require("./push-provider.service");

const MAX_ATTEMPTS = Math.max(1, Number(process.env.NOTIFICATION_MAX_ATTEMPTS || 5));

function failureDelaySeconds(attemptCount) {
    return Math.min(60 * (2 ** Math.max(0, attemptCount - 1)), 60 * 60);
}

async function claimPendingDeliveries(limit = 100) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await client.query(
            `WITH candidates AS (
                SELECT delivery.id
                FROM notification_deliveries delivery
                JOIN profile_notifications notification ON notification.id = delivery.notification_id
                JOIN LATERAL (
                    SELECT token.id
                    FROM user_push_tokens token
                    WHERE token.user_id = notification.user_id
                      AND token.is_active = TRUE
                      AND (delivery.push_token_id IS NULL OR token.id = delivery.push_token_id)
                    ORDER BY token.last_seen_at DESC
                    LIMIT 1
                ) token ON TRUE
                WHERE delivery.channel = 'PUSH'
                  AND delivery.status = 'PENDING'
                  AND delivery.next_attempt_at <= NOW()
                ORDER BY delivery.created_at ASC
                FOR UPDATE SKIP LOCKED
                LIMIT $1
             )
             UPDATE notification_deliveries delivery
             SET status = 'PROCESSING', attempt_count = delivery.attempt_count + 1, attempted_at = NOW()
             FROM candidates
             WHERE delivery.id = candidates.id
             RETURNING delivery.id, delivery.attempt_count, delivery.notification_id`,
            [Math.max(1, Math.min(Number(limit) || 100, 500))],
        );

        const ids = result.rows.map((row) => row.id);
        const details = ids.length ? await client.query(
            `SELECT delivery.id, delivery.attempt_count, notification.title, notification.message,
                    notification.deep_link, notification.metadata, token.expo_push_token, token.id AS push_token_id
             FROM notification_deliveries delivery
             JOIN profile_notifications notification ON notification.id = delivery.notification_id
             JOIN LATERAL (
                SELECT token.id, token.expo_push_token
                FROM user_push_tokens token
                WHERE token.user_id = notification.user_id AND token.is_active = TRUE
                  AND (delivery.push_token_id IS NULL OR token.id = delivery.push_token_id)
                ORDER BY token.last_seen_at DESC LIMIT 1
             ) token ON TRUE
             WHERE delivery.id = ANY($1::uuid[])`,
            [ids],
        ) : { rows: [] };
        await client.query("COMMIT");
        return details.rows;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function markDeliveryFailure(delivery, error) {
    const terminal = delivery.attempt_count >= MAX_ATTEMPTS;
    const values = terminal
        ? [String(error.message || error).slice(0, 500), delivery.id]
        : [String(error.message || error).slice(0, 500), failureDelaySeconds(delivery.attempt_count), delivery.id];
    await pool.query(
        terminal
            ? "UPDATE notification_deliveries SET status='FAILED', failure_reason=$1 WHERE id=$2"
            : "UPDATE notification_deliveries SET status='PENDING', failure_reason=$1, next_attempt_at=NOW() + ($2 * INTERVAL '1 second') WHERE id=$3",
        values,
    );
}

async function deliverPendingPushes({ limit = 100 } = {}) {
    if (!isPushEnabled()) return { skipped: true, reason: "Push delivery is disabled", accepted: 0 };
    const deliveries = await claimPendingDeliveries(limit);
    let accepted = 0;
    for (const delivery of deliveries) {
        try {
            const receipt = await sendExpoPush({
                token: delivery.expo_push_token,
                title: delivery.title,
                message: delivery.message,
                deepLink: delivery.deep_link,
                metadata: delivery.metadata || {},
            });
            await pool.query(
                "UPDATE notification_deliveries SET status='ACCEPTED', provider_message_id=$1, failure_reason=NULL WHERE id=$2",
                [receipt.ticketId, delivery.id],
            );
            accepted += 1;
        } catch (error) {
            await markDeliveryFailure(delivery, error);
        }
    }
    return { skipped: false, accepted };
}

async function reconcilePushReceipts({ limit = 100 } = {}) {
    if (!isPushEnabled()) return { skipped: true, reconciled: 0 };
    const pending = await pool.query(
        `SELECT delivery.id, delivery.provider_message_id, delivery.push_token_id
         FROM notification_deliveries delivery
         JOIN profile_notifications notification ON notification.id = delivery.notification_id
         WHERE delivery.channel='PUSH' AND delivery.status='ACCEPTED' AND delivery.provider_message_id IS NOT NULL
         ORDER BY delivery.attempted_at ASC LIMIT $1`,
        [Math.max(1, Math.min(Number(limit) || 100, 500))],
    );
    const receipts = await getExpoReceipts(pending.rows.map((row) => row.provider_message_id));
    let reconciled = 0;
    for (const delivery of pending.rows) {
        const receipt = receipts[delivery.provider_message_id];
        if (!receipt) continue;
        if (receipt.status === "ok") {
            await pool.query("UPDATE notification_deliveries SET status='SENT', failure_reason=NULL WHERE id=$1", [delivery.id]);
        } else {
            const reason = String(receipt.message || receipt.details?.error || "Push receipt failed").slice(0, 500);
            await pool.query("UPDATE notification_deliveries SET status='FAILED', failure_reason=$1 WHERE id=$2", [reason, delivery.id]);
            if (receipt.details?.error === "DeviceNotRegistered") {
                await pool.query("UPDATE user_push_tokens SET is_active=FALSE, updated_at=NOW() WHERE id=$1", [delivery.push_token_id]);
            }
        }
        reconciled += 1;
    }
    return { skipped: false, reconciled };
}

async function runNotificationDeliveryCycle() {
    const delivery = await deliverPendingPushes();
    const receipts = await reconcilePushReceipts();
    return { delivery, receipts };
}

function startNotificationDeliveryWorker({ intervalMs = 15_000, logger = console } = {}) {
    const safeInterval = Math.max(5_000, Number(intervalMs) || 15_000);
    const run = () => runNotificationDeliveryCycle().catch((error) => logger.error("[NotificationDelivery] Cycle failed:", error.message));
    void run();
    const timer = setInterval(run, safeInterval);
    timer.unref?.();
    return () => clearInterval(timer);
}

module.exports = { deliverPendingPushes, reconcilePushReceipts, runNotificationDeliveryCycle, startNotificationDeliveryWorker };
