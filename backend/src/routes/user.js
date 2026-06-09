const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const prisma = require("../config/db");

// Simple inline fetch for list of users to keep original profile routes working
router.get("/profile", auth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
      createdAt: user.createdAt
    });
  } catch (err) {
    next(err);
  }
});

router.get("/list", auth, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" }
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.get("/admin/users", auth, authorize("admin"), UserController.getAllUsers);
router.delete("/admin/users/:id", auth, authorize("admin"), async (req, res, next) => {
  try {
    const userIdToDelete = parseInt(req.params.id, 10);
    if (userIdToDelete === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }
    await UserController.deleteUser(req, res, next);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
