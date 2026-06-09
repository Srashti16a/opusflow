const prisma = require("../config/db");

class NotificationRepository {
  async createNotification(userId, title, message) {
    return prisma.notification.create({
      data: {
        userId: parseInt(userId),
        title,
        message,
        isRead: false
      }
    });
  }

  async findByUserId(userId) {
    return prisma.notification.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: "desc" }
    });
  }

  async findUnreadByUserId(userId) {
    return prisma.notification.findMany({
      where: {
        userId: parseInt(userId),
        isRead: false
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async markAsRead(id) {
    return prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true }
    });
  }

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: {
        userId: parseInt(userId),
        isRead: false
      },
      data: { isRead: true }
    });
  }
}

module.exports = new NotificationRepository();
