const NotificationRepository = require("../repositories/NotificationRepository");

class NotificationService {
  async notify(userId, title, message) {
    try {
      return await NotificationRepository.createNotification(userId, title, message);
    } catch (err) {
      console.error(`Failed to create notification for user ${userId}:`, err);
    }
  }

  async getNotifications(userId, unreadOnly = false) {
    if (unreadOnly) {
      return NotificationRepository.findUnreadByUserId(userId);
    }
    return NotificationRepository.findByUserId(userId);
  }

  async markAsRead(id) {
    return NotificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId) {
    return NotificationRepository.markAllAsRead(userId);
  }
}

module.exports = new NotificationService();
