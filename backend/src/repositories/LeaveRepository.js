const prisma = require("../config/db");

class LeaveRepository {
  async findById(id) {
    return prisma.leaveRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        employeeProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });
  }

  async createLeave(employeeProfileId, data) {
    return prisma.leaveRequest.create({
      data: {
        employeeProfileId: parseInt(employeeProfileId),
        leaveType: data.leaveType,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason,
        status: "pending"
      }
    });
  }

  async findByEmployeeId(employeeProfileId) {
    return prisma.leaveRequest.findMany({
      where: { employeeProfileId: parseInt(employeeProfileId) },
      orderBy: { createdAt: "desc" }
    });
  }

  async findPending() {
    return prisma.leaveRequest.findMany({
      where: { status: "pending" },
      include: {
        employeeProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            department: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });
  }

  async findHistory() {
    return prisma.leaveRequest.findMany({
      where: {
        status: { in: ["approved", "rejected"] }
      },
      include: {
        employeeProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async updateStatus(id, status, rejectionReason = null) {
    return prisma.leaveRequest.update({
      where: { id: parseInt(id) },
      data: {
        status,
        rejectionReason
      }
    });
  }

  async calculateLeaveBalance(employeeProfileId, leaveType) {
    const result = await prisma.$queryRawUnsafe(
      `SELECT calculate_leave_balance($1, $2) AS balance;`,
      parseInt(employeeProfileId),
      leaveType
    );
    return result[0]?.balance ?? 30;
  }
}

module.exports = new LeaveRepository();
