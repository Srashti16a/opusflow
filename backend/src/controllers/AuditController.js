const AuditService = require("../services/AuditService");

class AuditController {
  async getAuditLogs(req, res, next) {
    try {
      const { tableName, actionType, performedBy, limit, page } = req.query;
      const logs = await AuditService.getAuditLogs({
        tableName,
        actionType,
        performedBy,
        limit,
        page
      });
      res.json(logs); // { logs, total }
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuditController();
