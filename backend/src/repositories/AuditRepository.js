const prisma = require("../config/db");

class AuditRepository {
  async logAction(tableName, actionType, recordId, oldData, newData, performedBy) {
    return prisma.auditLog.create({
      data: {
        tableName,
        actionType,
        recordId: parseInt(recordId),
        oldData: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
        newData: newData ? JSON.parse(JSON.stringify(newData)) : null,
        performedBy: performedBy ? parseInt(performedBy) : null
      }
    });
  }

  async findAll({ tableName, actionType, performedBy, limit, offset }) {
    const where = {};

    if (tableName) {
      where.tableName = tableName;
    }

    if (actionType) {
      where.actionType = actionType;
    }

    if (performedBy) {
      where.performedBy = parseInt(performedBy);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined
    });

    const total = await prisma.auditLog.count({ where });

    return { logs, total };
  }
}

module.exports = new AuditRepository();
