const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const verifyToken = require("../middleware/auth");

// GET all departments
router.get("/", verifyToken, async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { department_name: "asc" }
    });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to load departments" });
  }
});

// POST new department
router.post("/", verifyToken, async (req, res) => {
  const { department_name } = req.body;
  if (!department_name || department_name.trim() === "") {
    return res.status(400).json({ message: "Department name is required" });
  }

  try {
    const existing = await prisma.department.findFirst({
      where: { department_name: department_name.trim() }
    });

    if (existing) {
      return res.status(400).json({ message: "Department already exists" });
    }

    const newDept = await prisma.department.create({
      data: { department_name: department_name.trim() }
    });

    res.status(201).json({
      message: "Department created successfully",
      department: newDept
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create department" });
  }
});

module.exports = router;
