const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const kycRoutes = require("./routes/kyc.routes");
const walletRoutes = require("./routes/wallet.routes");
const walletPaymentsRoutes = require("./routes/wallet-payments.routes");
const onboardingRoutes = require("./routes/onboarding.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const demoContestRoutes = require("./routes/demo-contest.routes");
const adminContestRoutes = require("./routes/admin-contest.routes");
const marketRoutes = require("./routes/market.routes");
const profileRoutes = require("./routes/profile.routes");
const {
    errorHandler,
    notFoundHandler,
} = require("./middleware/errorHandler");

const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/wallet/payments", walletPaymentsRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/demo-contests", demoContestRoutes);
app.use("/api/admin", adminContestRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/profile", profileRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
