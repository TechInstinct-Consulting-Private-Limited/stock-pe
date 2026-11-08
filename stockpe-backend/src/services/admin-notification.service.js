const pool = require("../config/database");
const { createForVerifiedUsers } = require("./profile-notification.service");

function error(statusCode, message) { const result = new Error(message); result.statusCode = statusCode; result.isOperational = true; return result; }
function text(value, maximum) { return String(value || "").trim().slice(0, maximum); }

async function listNotifications({ type, status, limit = 100 } = {}) {
    const filters = []; const values = [];
    if (type) { values.push(text(type, 80)); filters.push(`notification.type=$${values.length}`); }
    if (status === "UNREAD") filters.push("notification.read_at IS NULL");
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    values.push(Math.max(1, Math.min(Number(limit) || 100, 250)));
    const result = await pool.query(`SELECT notification.id,notification.type,notification.title,notification.message,notification.priority,notification.deep_link,notification.read_at,notification.created_at,users.mobile,COUNT(delivery.id)::int AS delivery_count,COUNT(delivery.id) FILTER (WHERE delivery.status='FAILED')::int AS failed_count FROM profile_notifications notification JOIN users ON users.id=notification.user_id LEFT JOIN notification_deliveries delivery ON delivery.notification_id=notification.id ${where} GROUP BY notification.id,users.mobile ORDER BY notification.created_at DESC LIMIT $${values.length}`, values);
    return result.rows;
}

async function getMetrics() {
    const result = await pool.query(`SELECT COUNT(*)::int AS total,COUNT(*) FILTER (WHERE read_at IS NULL)::int AS unread,COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS last_24_hours,(SELECT COUNT(*)::int FROM notification_deliveries WHERE status='FAILED') AS failed_deliveries FROM profile_notifications`);
    return result.rows[0];
}

async function listTemplates() { return (await pool.query("SELECT id,code,title_template,message_template,category,is_active,updated_at FROM notification_templates ORDER BY category,code")).rows; }

async function sendCampaign(campaignId) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const found = await client.query("SELECT * FROM notification_campaigns WHERE id=$1 FOR UPDATE", [campaignId]);
        if (!found.rowCount) throw error(404, "Campaign was not found");
        const campaign = found.rows[0];
        if (["SENT", "CANCELLED"].includes(campaign.status)) { await client.query("COMMIT"); return campaign; }
        const ids = await createForVerifiedUsers(client, { type: "ADMIN_BROADCAST", title: campaign.title, message: campaign.message, metadata: { campaignId: campaign.id, category: campaign.category }, priority: campaign.priority, deepLink: campaign.deep_link, idempotencyKey: `campaign:${campaign.id}` });
        for (const notificationId of ids) await client.query(`INSERT INTO notification_campaign_recipients (campaign_id,user_id,notification_id) SELECT $1,user_id,$2 FROM profile_notifications WHERE id=$2 ON CONFLICT DO NOTHING`, [campaign.id, notificationId]);
        await client.query("UPDATE notification_campaigns SET status='SENT',sent_at=NOW(),updated_at=NOW() WHERE id=$1", [campaign.id]);
        await client.query("COMMIT");
        return { ...campaign, status: "SENT", recipientCount: ids.length };
    } catch (reason) { await client.query("ROLLBACK"); throw reason; } finally { client.release(); }
}

async function createCampaign({ adminUserId, input }) {
    const title = text(input.title, 120); const message = text(input.message, 500);
    if (!title || !message) throw error(400, "title and message are required");
    const scheduledFor = input.scheduledFor ? new Date(input.scheduledFor) : null;
    if (scheduledFor && Number.isNaN(scheduledFor.getTime())) throw error(400, "scheduledFor must be a valid date");
    const status = scheduledFor && scheduledFor > new Date() ? "SCHEDULED" : "DRAFT";
    const campaign = (await pool.query(`INSERT INTO notification_campaigns (created_by,title,message,category,priority,deep_link,scheduled_for,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, [adminUserId, title, message, text(input.category || "SYSTEM", 40).toUpperCase(), text(input.priority || "NORMAL", 20).toUpperCase(), text(input.deepLink, 255) || null, scheduledFor, status])).rows[0];
    return status === "DRAFT" ? sendCampaign(campaign.id) : campaign;
}

async function sendDueCampaigns() { const rows = await pool.query("SELECT id FROM notification_campaigns WHERE status='SCHEDULED' AND scheduled_for<=NOW() ORDER BY scheduled_for ASC LIMIT 25"); for (const campaign of rows.rows) await sendCampaign(campaign.id); return rows.rowCount; }

module.exports = { createCampaign, getMetrics, listNotifications, listTemplates, sendCampaign, sendDueCampaigns };
