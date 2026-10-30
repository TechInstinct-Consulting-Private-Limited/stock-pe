require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const { startContestLifecycleScheduler } = require("./src/services/contest-lifecycle.service");
const { startNotificationDeliveryWorker } = require("./src/services/notification-delivery-worker.service");
const marketService = require("./src/services/market.service");
const { startDhanLiveFeed } = require("./src/services/dhan-live-feed.service");
const { attachMarketLiveBroadcast } = require("./src/services/market-live-broadcast.service");

const PORT = process.env.PORT || 5000;
const lifecycleIntervalMs = Number(process.env.CONTEST_LIFECYCLE_INTERVAL_MS || 15_000);

const server = http.createServer(app);
const marketLiveBroadcast = attachMarketLiveBroadcast(server, {
    getInitialIndices: async () => (await marketService.getLiveIndices()).indices,
    intervalMs: Number(process.env.MARKET_LIVE_BROADCAST_INTERVAL_MS || 500),
});
const dhanLiveFeed = startDhanLiveFeed({
    subscriptions: marketService.getDhanLiveSubscriptions(),
    onTick: (tick) => {
        const quote = marketService.applyDhanLiveTick(tick);
        if (quote) marketLiveBroadcast.publish(quote);
    },
});

server.listen(PORT, () => {
    console.log(`StockPE Backend running on port ${PORT}`);
});

const stopContestLifecycleScheduler = startContestLifecycleScheduler({ intervalMs: lifecycleIntervalMs });
const stopEmbeddedNotificationWorker = process.env.NOTIFICATION_DELIVERY_MODE === "separate"
    ? () => {}
    : startNotificationDeliveryWorker({ intervalMs: Number(process.env.NOTIFICATION_DELIVERY_INTERVAL_MS || 15_000) });

function shutdown() {
    stopContestLifecycleScheduler();
    stopEmbeddedNotificationWorker();
    dhanLiveFeed.stop();
    marketLiveBroadcast.close();
    server.close(() => process.exit(0));
}

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
