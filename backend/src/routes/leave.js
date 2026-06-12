const express = require("express");
const router = express.Router();
const LeaveController = require("../controllers/LeaveController");
const verifyToken = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validation");
const { applyLeaveSchema, rejectLeaveSchema } = require("../validators/leaveValidator");

router.post("/", verifyToken, validate(applyLeaveSchema), LeaveController.applyLeave);
router.get("/my-requests", verifyToken, LeaveController.getMyRequests);
router.get("/balance", verifyToken, LeaveController.getLeaveBalance);

// Approver routes
router.get("/pending", verifyToken, authorize("admin", "manager", "hr"), LeaveController.getPendingRequests);
router.get("/history", verifyToken, authorize("admin", "manager", "hr"), LeaveController.getHistoryRequests);
router.put("/:id/approve", verifyToken, authorize("admin", "manager", "hr"), LeaveController.approveLeave);
router.put("/:id/reject", verifyToken, authorize("admin", "manager", "hr"), validate(rejectLeaveSchema), LeaveController.rejectLeave);

module.exports = router;
