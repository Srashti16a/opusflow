const LeaveService = require("../services/LeaveService");

class LeaveController {
  async applyLeave(req, res, next) {
    try {
      const userId = req.user.id;
      const leave = await LeaveService.applyLeave(userId, req.body);
      res.status(201).json({
        message: "Leave request submitted successfully. It is now pending approval.",
        leave
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyRequests(req, res, next) {
    try {
      const userId = req.user.id;
      const requests = await LeaveService.getMyRequests(userId);
      res.json(requests);
    } catch (err) {
      next(err);
    }
  }

  async getPendingRequests(req, res, next) {
    try {
      const requests = await LeaveService.getPendingRequests();
      res.json(requests);
    } catch (err) {
      next(err);
    }
  }

  async getHistoryRequests(req, res, next) {
    try {
      const requests = await LeaveService.getHistoryRequests();
      res.json(requests);
    } catch (err) {
      next(err);
    }
  }

  async approveLeave(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const performedBy = req.user.id;
      const result = await LeaveService.approveLeave(id, performedBy);
      res.json({
        message: "Leave request approved successfully.",
        request: result
      });
    } catch (err) {
      next(err);
    }
  }

  async rejectLeave(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const { rejectionReason } = req.body;
      const performedBy = req.user.id;
      const result = await LeaveService.rejectLeave(id, rejectionReason, performedBy);
      res.json({
        message: "Leave request rejected successfully.",
        request: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getLeaveBalance(req, res, next) {
    try {
      const userId = req.user.id;
      const { leaveType } = req.query;
      if (!leaveType) {
        return res.status(400).json({ message: "leaveType is required" });
      }
      const balance = await LeaveService.getLeaveBalance(userId, leaveType);
      res.json({ leaveType, balance });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new LeaveController();
