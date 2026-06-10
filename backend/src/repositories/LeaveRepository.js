const prisma = require("../config/db");

function mapLeaveApplication(app) {
  if (!app) return null;
  return {
    id: app.id,
    employeeProfileId: app.employeeId,
    leaveType: app.leaveType?.leave_name || "Unknown",
    startDate: app.from_date,
    endDate: app.to_date,
    total_days: app.total_days,
    reason: app.reason,
    status: app.status ? app.status.toLowerCase() : "pending",
    rejectionReason: app.approvalHistory && app.approvalHistory.length > 0
      ? app.approvalHistory[0].remarks
      : null,
    createdAt: app.createdAt,
    employeeProfile: app.employeeProfile ? {
      id: app.employeeProfile.id,
      userId: app.employeeProfile.userId,
      departmentId: app.employeeProfile.departmentId,
      phone: app.employeeProfile.phone,
      address: app.employeeProfile.address,
      designation: app.employeeProfile.designation,
      salary: app.employeeProfile.salary,
      createdAt: app.employeeProfile.createdAt,
      user: app.employeeProfile.user ? {
        id: app.employeeProfile.user.id,
        name: app.employeeProfile.user.name,
        email: app.employeeProfile.user.email
      } : null,
      department: app.employeeProfile.department || null
    } : null
  };
}

class LeaveRepository {
  async findById(id) {
    const app = await prisma.leaveApplication.findUnique({
      where: { id: parseInt(id) },
      include: {
        leaveType: true,
        employeeProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            department: true
          }
        },
        approvalHistory: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });
    return mapLeaveApplication(app);
  }

  async createLeave(employeeProfileId, data) {
    // Find LeaveType by name (case-insensitive)
    let leaveType = await prisma.leaveType.findFirst({
      where: {
        leave_name: {
          equals: data.leaveType,
          mode: "insensitive"
        }
      }
    });

    if (!leaveType) {
      // Create if it doesn't exist to prevent crash
      leaveType = await prisma.leaveType.create({
        data: {
          leave_name: data.leaveType,
          total_days: 15
        }
      });
    }

    const requestedDays = Math.round((new Date(data.endDate) - new Date(data.startDate)) / (1000 * 60 * 60 * 24)) + 1;

    const newApp = await prisma.leaveApplication.create({
      data: {
        employeeId: parseInt(employeeProfileId),
        leaveTypeId: leaveType.id,
        from_date: new Date(data.startDate),
        to_date: new Date(data.endDate),
        total_days: requestedDays,
        reason: data.reason,
        status: "Pending"
      },
      include: {
        leaveType: true,
        employeeProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            department: true
          }
        }
      }
    });

    return mapLeaveApplication(newApp);
  }

  async findByEmployeeId(employeeProfileId) {
    const apps = await prisma.leaveApplication.findMany({
      where: { employeeId: parseInt(employeeProfileId) },
      include: {
        leaveType: true,
        employeeProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            department: true
          }
        },
        approvalHistory: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return apps.map(mapLeaveApplication);
  }

  async findPending() {
    const apps = await prisma.leaveApplication.findMany({
      where: { status: "Pending" },
      include: {
        leaveType: true,
        employeeProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            department: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });
    return apps.map(mapLeaveApplication);
  }

  async findHistory() {
    const apps = await prisma.leaveApplication.findMany({
      where: {
        status: { in: ["Approved", "Rejected"] }
      },
      include: {
        leaveType: true,
        employeeProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            department: true
          }
        },
        approvalHistory: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return apps.map(mapLeaveApplication);
  }

  async updateStatus(id, status, remarks = null, performedBy = null) {
    const dbStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(); // approved -> Approved
    
    await prisma.$transaction(async (tx) => {
      await tx.leaveApplication.update({
        where: { id: parseInt(id) },
        data: { status: dbStatus }
      });

      if (performedBy) {
        await tx.approvalHistory.create({
          data: {
            leaveId: parseInt(id),
            approvedBy: parseInt(performedBy),
            action: dbStatus,
            remarks: remarks
          }
        });
      }
    });

    return this.findById(id);
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
