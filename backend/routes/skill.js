const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const verifyToken = require("../middleware/auth");

// GET all skills
router.get("/", verifyToken, async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { skill_name: "asc" }
    });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to load skills" });
  }
});

// POST new skill
router.post("/", verifyToken, async (req, res) => {
  const { skill_name } = req.body;
  if (!skill_name || skill_name.trim() === "") {
    return res.status(400).json({ message: "Skill name is required" });
  }

  try {
    const existing = await prisma.skill.findFirst({
      where: { skill_name: skill_name.trim() }
    });

    if (existing) {
      return res.status(400).json({ message: "Skill already exists" });
    }

    const newSkill = await prisma.skill.create({
      data: { skill_name: skill_name.trim() }
    });

    res.status(201).json({
      message: "Skill created successfully",
      skill: newSkill
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create skill" });
  }
});

module.exports = router;
