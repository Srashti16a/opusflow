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

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
