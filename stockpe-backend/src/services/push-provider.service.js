const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const EXPO_RECEIPTS_URL = "https://exp.host/--/api/v2/push/getReceipts";

function isPushEnabled() {
    return process.env.EXPO_PUSH_NOTIFICATIONS_ENABLED === "true";
}

function headers() {
    return {
        accept: "application/json",
        "accept-encoding": "gzip, deflate",
        "content-type": "application/json",
    };
}

async function parseResponse(response) {
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body?.errors?.length) {
        throw new Error(body?.errors?.[0]?.message || `Push provider returned ${response.status}`);
    }
    return body;
}

async function sendExpoPush({ token, title, message, deepLink, metadata = {} }) {
    const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
            to: token,
            sound: "default",
            title,
            body: message,
            data: { ...metadata, deepLink },
        }),
    });
    const body = await parseResponse(response);
    const ticket = body?.data?.[0];
    if (!ticket || ticket.status === "error") {
        throw new Error(ticket?.message || "Push provider rejected delivery");
    }
    return { ticketId: ticket.id || null };
}

async function getExpoReceipts(ticketIds) {
    if (!ticketIds.length) return {};
    const response = await fetch(EXPO_RECEIPTS_URL, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ ids: ticketIds }),
    });
    const body = await parseResponse(response);
    return body?.data || {};
}

module.exports = { getExpoReceipts, isPushEnabled, sendExpoPush };
