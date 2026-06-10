const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const verifyToken = require("../middleware/auth");
const cache = require("../config/cache");

router.get("/", verifyToken, async (req, res, next) => {
  try {
    const cacheKey = "departments:all";
    let departments = cache.get(cacheKey);
    if (!departments) {
      departments = await prisma.department.findMany({
        orderBy: { department_name: "asc" }
      });
      cache.set(cacheKey, departments);
    }
    res.json(departments);
  } catch (err) {
    next(err);
  }
});

router.post("/", verifyToken, async (req, res, next) => {
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

    // Invalidate the cache
    cache.del("departments:all");

    res.status(201).json({
      message: "Department created successfully",
      department: newDept
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
