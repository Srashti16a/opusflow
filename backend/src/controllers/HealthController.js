const prisma = require("../config/db");
const { trafficStats } = require("../middleware/trafficTracker");

class HealthController {
  async getHealth(req, res, next) {
    try {
      // 1. Verify Database Connection
      let dbStatus = "UP";
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch (dbError) {
        dbStatus = "DOWN";
      }

      // 2. Count Total Registered Users
      let userCount = 0;
      if (dbStatus === "UP") {
        try {
          userCount = await prisma.user.count();
        } catch (err) {
          userCount = 0;
        }
      }

      // 3. System Telemetry
      const telemetry = {
        status: dbStatus === "UP" ? "UP" : "DEGRADED",
        uptime: process.uptime(), // in seconds
        memoryUsage: {
          rss: Math.round(process.memoryUsage().rss / (1024 * 1024)) + " MB",
          heapTotal: Math.round(process.memoryUsage().heapTotal / (1024 * 1024)) + " MB",
          heapUsed: Math.round(process.memoryUsage().heapUsed / (1024 * 1024)) + " MB",
          external: Math.round(process.memoryUsage().external / (1024 * 1024)) + " MB",
        },
        database: dbStatus,
        totalUsers: userCount,
        traffic: {
          totalRequests: trafficStats.totalRequests,
          failedLogins: trafficStats.failedLogins
        },
        timestamp: new Date().toISOString()
      };

      res.json(telemetry);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new HealthController();
