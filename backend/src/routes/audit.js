const express = require("express");
const router = express.Router();
const AuditController = require("../controllers/AuditController");
const verifyToken = require("../middleware/auth");
const authorize = require("../middleware/authorize");

router.get("/", verifyToken, authorize("admin", "manager"), AuditController.getAuditLogs);

module.exports = router;
