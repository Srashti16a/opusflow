const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

// 1. User Profile Route (Protected - all logged in users can access)
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// 1b. Helper: Get simple users list (id, name, email) for dropdown (Protected - all logged in users)
router.get("/list", auth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: { name: "asc" }
    });
    res.json(users);
  } catch (error) {
    console.error("Fetch users dropdown list error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// 2. Admin: Get all users (Protected - Admin only)
router.get("/admin/users", auth, authorize("admin"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(users);
  } catch (error) {
    console.error("Admin fetch users error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// 3. Admin: Delete a user (Protected - Admin only)
router.delete("/admin/users/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const userIdToDelete = parseInt(req.params.id, 10);

    if (isNaN(userIdToDelete)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Prevent admin from deleting themselves
    if (userIdToDelete === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userIdToDelete }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.delete({
      where: { id: userIdToDelete }
    });

    res.json({ message: `User '${user.name}' has been deleted successfully.` });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

module.exports = router;
