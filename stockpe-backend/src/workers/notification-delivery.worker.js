require("dotenv").config();

const { startNotificationDeliveryWorker } = require("../services/notification-delivery-worker.service");

const stop = startNotificationDeliveryWorker({
    intervalMs: Number(process.env.NOTIFICATION_DELIVERY_INTERVAL_MS || 15_000),
});

function shutdown() {
    stop();
    process.exit(0);
}

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
