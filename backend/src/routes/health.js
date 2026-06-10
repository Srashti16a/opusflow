const express = require("express");
const router = express.Router();
const HealthController = require("../controllers/HealthController");

// v1 Health API
router.get("/v1/health", HealthController.getHealth);

// v2 Health API (Placeholder for future telemetry enhancements)
router.get("/v2/health", (req, res) => {
  res.json({
    status: "UP",
    version: "v2",
    message: "Telemetry v2 placeholder",
    timestamp: new Date().toISOString()
  });
});

// Backward compatibility health route alias
router.get("/health", HealthController.getHealth);

module.exports = router;
