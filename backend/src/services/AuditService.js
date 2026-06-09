const AuditRepository = require("../repositories/AuditRepository");

class AuditService {
  async logAction(tableName, actionType, recordId, oldData, newData, performedBy) {
    try {
      return await AuditRepository.logAction(tableName, actionType, recordId, oldData, newData, performedBy);
    } catch (error) {
      console.error(`Failed to write audit log for ${tableName}:`, error);
    }
  }

  async getAuditLogs(filters) {
    const limit = filters.limit ? parseInt(filters.limit) : 20;
    const page = filters.page ? parseInt(filters.page) : 1;
    const offset = (page - 1) * limit;

    return AuditRepository.findAll({
      tableName: filters.tableName,
      actionType: filters.actionType,
      performedBy: filters.performedBy,
      limit,
      offset
    });
  }
}

module.exports = new AuditService();
