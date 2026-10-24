require("dotenv").config();

const app = require("./src/app");
const { startContestLifecycleScheduler } = require("./src/services/contest-lifecycle.service");

const PORT = process.env.PORT || 5000;
const lifecycleIntervalMs = Number(process.env.CONTEST_LIFECYCLE_INTERVAL_MS || 15_000);

const server = app.listen(PORT, () => {
    console.log(`StockPE Backend running on port ${PORT}`);
});

const stopContestLifecycleScheduler = startContestLifecycleScheduler({ intervalMs: lifecycleIntervalMs });

function shutdown() {
    stopContestLifecycleScheduler();
    server.close(() => process.exit(0));
}

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
