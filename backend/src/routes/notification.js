const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/NotificationController");
const verifyToken = require("../middleware/auth");

router.get("/", verifyToken, NotificationController.getMyNotifications);
router.put("/read-all", verifyToken, NotificationController.markAllAsRead);
router.put("/:id/read", verifyToken, NotificationController.markAsRead);

module.exports = router;
