require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const logger = require("./src/utils/logger");
const errorHandler = require("./src/middleware/errorHandler");

const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/user");
const departmentRoutes = require("./src/routes/department");
const skillRoutes = require("./src/routes/skill");
const employeeRoutes = require("./src/routes/employee");
const leaveRoutes = require("./src/routes/leave");
const assetRoutes = require("./src/routes/asset");
const notificationRoutes = require("./src/routes/notification");
const auditRoutes = require("./src/routes/audit");
const healthRoutes = require("./src/routes/health");

const { trafficTracker } = require("./src/middleware/trafficTracker");

// Start background cron jobs
require("./src/jobs/cronJobs");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://employee-management.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || process.env.NODE_ENV !== "production") return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS policy violation"), false);
  },
  credentials: true
}));

app.use(express.json());
app.use(trafficTracker);

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Versioned health routes (/api/v1/health and /api/v2/health)
app.use("/api", healthRoutes);

// Versioned v1 API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/skills", skillRoutes);
app.use("/api/v1/employees", employeeRoutes);
app.use("/api/v1/leaves", leaveRoutes);
app.use("/api/v1/assets", assetRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/audit-logs", auditRoutes);

// Backward Compatibility Aliases (/api/ -> /api/v1/)
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit-logs", auditRoutes);

// Root test endpoint
app.get("/", (req, res) => {
  res.json({ message: "Isoft EventHub 360 API is running with upgraded Controller-Service-Repository architecture!" });
});

// Error handling middleware (must be registered after all routes)
app.use(errorHandler);

// Start server if not in test environment
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

module.exports = app;
