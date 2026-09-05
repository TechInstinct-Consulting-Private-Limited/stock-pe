const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const kycRoutes = require("./routes/kyc.routes");
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

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
