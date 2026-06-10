const cron = require("node-cron");
const prisma = require("../config/db");
const logger = require("../utils/logger");

// Only schedule cron jobs if not running tests
if (process.env.NODE_ENV !== "test") {
  // 1. Daily Leave Report Summary - 11 PM every day (0 23 * * *)
  cron.schedule("0 23 * * *", async () => {
    try {
      logger.info("CronJob: Starting Daily Leave Report Summary creation...");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeLeaves = await prisma.leaveApplication.findMany({
        where: {
          status: "Approved",
          from_date: { lte: today },
          to_date: { gte: today }
        },
        include: {
          employeeProfile: {
            include: {
              user: { select: { name: true } }
            }
          }
        }
      });

      const pendingLeaves = await prisma.leaveApplication.count({
        where: { status: "Pending" }
      });

      logger.info(`[DAILY LEAVE REPORT] Date: ${today.toDateString()}
- Total Active Approved Leaves Today: ${activeLeaves.length}
- Employees on Leave: ${activeLeaves.map(l => l.employeeProfile.user.name).join(", ") || "None"}
- Pending Leave Requests Awaiting Action: ${pendingLeaves}`);
    } catch (error) {
      logger.error("CronJob: Error generating Daily Leave Report Summary", error);
    }
  });

  // 2. Daily Backup Simulation Log - 1 AM every day (0 1 * * *)
  cron.schedule("0 1 * * *", () => {
    logger.info("CronJob: Starting Daily Simulated Database Backup...");
    logger.info(`[DATABASE BACKUP SUCCESS] Simulated SQL Dump complete. Target: backup_${new Date().toISOString().slice(0,10)}.sql.gz`);
  });

  // 3. Automatic Cleanup of read notifications older than 30 days - 2 AM every day (0 2 * * *)
  cron.schedule("0 2 * * *", async () => {
    try {
      logger.info("CronJob: Starting automatic cleanup of old read notifications...");
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);

      const deleteResult = await prisma.notification.deleteMany({
        where: {
          isRead: true,
          createdAt: { lt: cutoffDate }
        }
      });

      logger.info(`[NOTIFICATION CLEANUP SUCCESS] Cleared ${deleteResult.count} read notifications older than 30 days.`);
    } catch (error) {
      logger.error("CronJob: Error during notifications cleanup", error);
    }
  });

  logger.info("CronJobs: All background cron jobs registered successfully.");
}
