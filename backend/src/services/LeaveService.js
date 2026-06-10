const LeaveRepository = require("../repositories/LeaveRepository");
const EmployeeRepository = require("../repositories/EmployeeRepository");
const NotificationService = require("./NotificationService");
const AuditService = require("./AuditService");

class LeaveService {
  async applyLeave(userId, data) {
    const profile = await EmployeeRepository.findByUserId(userId);
    if (!profile) {
      const error = new Error("An Employee Profile must be created before applying for leaves.");
      error.statusCode = 400;
      throw error;
    }

    // Check balance via stored plpgsql function
    const currentBalance = await LeaveRepository.calculateLeaveBalance(profile.id, data.leaveType);
    const requestedDays = Math.round((new Date(data.endDate) - new Date(data.startDate)) / (1000 * 60 * 60 * 24)) + 1;

    if (requestedDays > currentBalance) {
      const error = new Error(`Insufficient leave balance! You requested ${requestedDays} days, but your remaining balance for ${data.leaveType} is only ${currentBalance} days.`);
      error.statusCode = 400;
      throw error;
    }

    const leave = await LeaveRepository.createLeave(profile.id, data);

    // Audit log
    await AuditService.logAction(
      "leave_requests",
      "INSERT",
      leave.id,
      null,
      leave,
      userId
    );

    return leave;
  }

  async getMyRequests(userId) {
    const profile = await EmployeeRepository.findByUserId(userId);
    if (!profile) {
      return [];
    }
    return LeaveRepository.findByEmployeeId(profile.id);
  }

  async getPendingRequests() {
    return LeaveRepository.findPending();
  }

  async getHistoryRequests() {
    return LeaveRepository.findHistory();
  }

  async approveLeave(id, performedBy) {
    const oldRequest = await LeaveRepository.findById(id);
    if (!oldRequest) {
      const error = new Error("Leave request not found");
      error.statusCode = 404;
      throw error;
    }

    const newRequest = await LeaveRepository.updateStatus(id, "approved", null, performedBy);

    // Audit log
    await AuditService.logAction(
      "leave_requests",
      "UPDATE",
      id,
      oldRequest,
      newRequest,
      performedBy
    );

    // Send notification to the employee
    if (oldRequest.employeeProfile?.userId) {
      await NotificationService.notify(
        oldRequest.employeeProfile.userId,
        "Leave Request Approved",
        `Your request for ${oldRequest.leaveType} from ${new Date(oldRequest.startDate).toLocaleDateString()} to ${new Date(oldRequest.endDate).toLocaleDateString()} has been approved.`
      );
    }

    return newRequest;
  }

  async rejectLeave(id, rejectionReason, performedBy) {
    const oldRequest = await LeaveRepository.findById(id);
    if (!oldRequest) {
      const error = new Error("Leave request not found");
      error.statusCode = 404;
      throw error;
    }

    const newRequest = await LeaveRepository.updateStatus(id, "rejected", rejectionReason, performedBy);

    // Audit log
    await AuditService.logAction(
      "leave_requests",
      "UPDATE",
      id,
      oldRequest,
      newRequest,
      performedBy
    );

    // Send notification to the employee
    if (oldRequest.employeeProfile?.userId) {
      await NotificationService.notify(
        oldRequest.employeeProfile.userId,
        "Leave Request Rejected",
        `Your request for ${oldRequest.leaveType} has been rejected. Feedback: "${rejectionReason}"`
      );
    }

    return newRequest;
  }

  async getLeaveBalance(userId, leaveType) {
    const profile = await EmployeeRepository.findByUserId(userId);
    if (!profile) {
      return 30;
    }
    return LeaveRepository.calculateLeaveBalance(profile.id, leaveType);
  }
}

module.exports = new LeaveService();
