const pool = require("../config/database");

function safeText(value, maximum = 240) { return String(value || "").trim().slice(0, maximum); }
function preferenceColumnFor(type) {
    if (String(type).startsWith("CONTEST_")) return "contest_push_enabled";
    if (String(type).startsWith("WALLET_") || type === "CONTEST_WON") return "wallet_push_enabled";
    if (type === "ADMIN_BROADCAST") return "marketing_push_enabled";
    return "system_push_enabled";
}

async function createNotification(client, { userId, type, title, message, metadata = {}, priority = "NORMAL", deepLink = null, idempotencyKey = null }) {
    const result = await client.query(
        `INSERT INTO profile_notifications (user_id, type, title, message, metadata, priority, deep_link, idempotency_key)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (user_id, idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING
         RETURNING id`,
        [userId, safeText(type, 80), safeText(title, 120), safeText(message, 500), metadata, safeText(priority, 20) || "NORMAL", deepLink, idempotencyKey],
    );
    if (!result.rowCount) return null;
    const notificationId = result.rows[0].id;
    const preferenceColumn = preferenceColumnFor(type);
    await client.query(`INSERT INTO notification_deliveries (notification_id, channel, status, attempted_at) VALUES ($1,'IN_APP','SENT',NOW())`, [notificationId]);
    await client.query(
        `INSERT INTO notification_deliveries (notification_id, push_token_id, channel, status)
         SELECT $1, token.id, 'PUSH', 'PENDING'
         FROM user_push_tokens token
         WHERE token.user_id=$2 AND token.is_active=TRUE
           AND COALESCE((SELECT ${preferenceColumn} FROM notification_preferences preference WHERE preference.user_id=$2), TRUE)`,
        [notificationId, userId],
    );
    return notificationId;
}

async function createForVerifiedUsers(client, payload) {
    const result = await client.query(
        `INSERT INTO profile_notifications (user_id, type, title, message, metadata, priority, deep_link, idempotency_key)
         SELECT u.id,$1,$2,$3,$4,$5,$6,$7 FROM users u WHERE u.mobile_verified=TRUE
         ON CONFLICT (user_id, idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING
         RETURNING id`,
        [safeText(payload.type, 80), safeText(payload.title, 120), safeText(payload.message, 500), payload.metadata || {}, safeText(payload.priority, 20) || "NORMAL", payload.deepLink || null, payload.idempotencyKey || null],
    );
    const ids = result.rows.map((row) => row.id);
    if (ids.length) {
        await client.query(`INSERT INTO notification_deliveries (notification_id, channel, status, attempted_at) SELECT id,'IN_APP','SENT',NOW() FROM profile_notifications WHERE id=ANY($1::uuid[])`, [ids]);
        const preferenceColumn = preferenceColumnFor(payload.type);
        await client.query(
            `INSERT INTO notification_deliveries (notification_id, push_token_id, channel, status)
             SELECT notification.id, token.id, 'PUSH', 'PENDING' FROM profile_notifications notification
             JOIN user_push_tokens token ON token.user_id=notification.user_id AND token.is_active=TRUE
             LEFT JOIN notification_preferences preference ON preference.user_id=notification.user_id
             WHERE notification.id=ANY($1::uuid[]) AND COALESCE(preference.${preferenceColumn},TRUE)`, [ids],
        );
    }
    return ids;
}

async function notifyContestCreated(client, contest) {
    return createForVerifiedUsers(client, {
        type: "CONTEST_CREATED", title: "New contest scheduled",
        message: `${contest.title} opens at ${new Date(contest.opensAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}.`,
        metadata: { publicId: contest.publicId, event: "CONTEST_CREATED" }, priority: "NORMAL", deepLink: `/events/${contest.publicId}`,
        idempotencyKey: `contest:${contest.publicId}:created`,
    });
}

async function notifyContestLifecycle(publicId, status) {
    const definitions = {
        OPEN: { title: "Contest is open", message: "is now accepting predictions.", priority: "HIGH" },
        LIVE: { title: "Predictions are closed", message: "is now live.", priority: "NORMAL" },
        CLOSED: { title: "Contest closed", message: "has closed. Results will be available after settlement.", priority: "NORMAL" },
        SETTLED: { title: "Contest result is ready", message: "has been settled. View your result.", priority: "HIGH" },
    };
    const definition = definitions[status];
    if (!definition) return [];
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const contest = await client.query("SELECT title FROM demo_dashboard_contests WHERE public_id=$1", [publicId]);
        if (!contest.rowCount) { await client.query("ROLLBACK"); return []; }
        const ids = await createForVerifiedUsers(client, {
            type: `CONTEST_${status}`, title: definition.title, message: `${contest.rows[0].title} ${definition.message}`,
            metadata: { publicId, event: `CONTEST_${status}` }, priority: definition.priority, deepLink: `/events/${publicId}`,
            idempotencyKey: `contest:${publicId}:${status.toLowerCase()}`,
        });
        await client.query("COMMIT");
        return ids;
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
}

async function registerPushToken(userId, token, platform) {
    const value = safeText(token, 255);
    if (!/^ExponentPushToken\[[^\]]+\]$/.test(value) && !/^ExpoPushToken\[[^\]]+\]$/.test(value)) {
        const error = new Error("A valid Expo push token is required"); error.statusCode = 400; error.isOperational = true; throw error;
    }
    await pool.query(`INSERT INTO user_push_tokens (user_id,expo_push_token,platform,is_active,last_seen_at,updated_at) VALUES ($1,$2,$3,TRUE,NOW(),NOW()) ON CONFLICT (expo_push_token) DO UPDATE SET user_id=EXCLUDED.user_id,platform=EXCLUDED.platform,is_active=TRUE,last_seen_at=NOW(),updated_at=NOW()`, [userId, value, safeText(platform, 24) || null]);
}

async function processPendingPushDeliveries({ limit = 100 } = {}) {
    if (process.env.EXPO_PUSH_NOTIFICATIONS_ENABLED !== "true") return { skipped: true, reason: "Push delivery is disabled" };
    const pending = await pool.query(`SELECT d.id,n.title,n.message,n.deep_link,token.expo_push_token FROM notification_deliveries d JOIN profile_notifications n ON n.id=d.notification_id JOIN user_push_tokens token ON token.user_id=n.user_id AND token.is_active=TRUE WHERE d.channel='PUSH' AND d.status='PENDING' ORDER BY d.created_at ASC LIMIT $1`, [Math.max(1, Math.min(Number(limit) || 100, 500))]);
    for (const delivery of pending.rows) {
        try {
            const response = await fetch("https://exp.host/--/api/v2/push/send", { method: "POST", headers: { "content-type": "application/json", accept: "application/json" }, body: JSON.stringify({ to: delivery.expo_push_token, sound: "default", title: delivery.title, body: delivery.message, data: { deepLink: delivery.deep_link } }) });
            const body = await response.json(); const receipt = body?.data?.[0];
            if (!response.ok || receipt?.status === "error") throw new Error(receipt?.message || "Expo push provider rejected delivery");
            await pool.query("UPDATE notification_deliveries SET status='SENT',provider_message_id=$1,attempted_at=NOW() WHERE id=$2", [receipt?.id || null, delivery.id]);
        } catch (error) { await pool.query("UPDATE notification_deliveries SET status='FAILED',failure_reason=$1,attempted_at=NOW() WHERE id=$2", [safeText(error.message, 500), delivery.id]); }
    }
    return { skipped: false, processed: pending.rowCount };
}

module.exports = { createNotification, createForVerifiedUsers, notifyContestCreated, notifyContestLifecycle, registerPushToken, processPendingPushDeliveries };
