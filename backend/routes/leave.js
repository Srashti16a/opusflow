const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const verifyToken = require("../middleware/auth");
const authorize = require("../middleware/authorize");

// 1. Apply for Leave (Protected - Standard User/Any role linked to an EmployeeProfile)
router.post("/", verifyToken, async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;

  if (!leaveType || !startDate || !endDate || !reason) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Find employee profile linked to the logged-in user
    const profile = await prisma.employeeProfile.findFirst({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.status(400).json({ 
        message: "Leave application failed: You must create an Employee Profile first." 
      });
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        employeeProfileId: profile.id,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: "pending"
      }
    });

    res.status(201).json({
      message: "Leave request submitted successfully",
      leave
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to submit leave request" });
  }
});

// 2. Fetch My Leave Requests (Protected - All logged-in users)
router.get("/my-requests", verifyToken, async (req, res) => {
  try {
    const profile = await prisma.employeeProfile.findFirst({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.json([]); // Return empty list if no profile exists yet
    }

    const requests = await prisma.leaveRequest.findMany({
      where: { employeeProfileId: profile.id },
      orderBy: { createdAt: "desc" }
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to load leave history" });
  }
});

// 3. Admin/Manager: Fetch all pending leave requests
router.get("/pending", verifyToken, authorize("admin", "manager"), async (req, res) => {
  try {
    const pendingRequests = await prisma.leaveRequest.findMany({
      where: { status: "pending" },
      include: {
        employeeProfile: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { department_name: true } }
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    res.json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to load pending leaves" });
  }
});

// 4. Admin/Manager: Fetch processed leave requests history
router.get("/history", verifyToken, authorize("admin", "manager"), async (req, res) => {
  try {
    const historyRequests = await prisma.leaveRequest.findMany({
      where: {
        status: { in: ["approved", "rejected"] }
      },
      include: {
        employeeProfile: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { department_name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(historyRequests);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to load processed leaves history" });
  }
});

// 5. Admin/Manager: Approve Leave Request
router.put("/:id/approve", verifyToken, authorize("admin", "manager"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const leave = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: { status: "approved", rejectionReason: null }
    });

    res.json({ message: "Leave request approved successfully", leave: updated });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to approve leave request" });
  }
});

// 6. Admin/Manager: Reject Leave Request
router.put("/:id/reject", verifyToken, authorize("admin", "manager"), async (req, res) => {
  const { rejectionReason } = req.body;
  
  if (!rejectionReason || rejectionReason.trim() === "") {
    return res.status(400).json({ message: "Rejection reason is required" });
  }

  try {
    const id = parseInt(req.params.id);

    const leave = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: { 
        status: "rejected", 
        rejectionReason: rejectionReason.trim() 
      }
    });

    res.json({ message: "Leave request rejected successfully", leave: updated });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to reject leave request" });
  }
});

module.exports = router;
