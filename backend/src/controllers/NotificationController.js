const NotificationService = require("../services/NotificationService");

class NotificationController {
  async getMyNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const { unread } = req.query;
      const notifications = await NotificationService.getNotifications(userId, unread === "true");
      res.json(notifications);
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const result = await NotificationService.markAsRead(id);
      res.json({ message: "Notification marked as read", notification: result });
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      await NotificationService.markAllAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
