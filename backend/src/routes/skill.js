const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const verifyToken = require("../middleware/auth");
const cache = require("../config/cache");

router.get("/", verifyToken, async (req, res, next) => {
  try {
    const cacheKey = "skills:all";
    let skills = cache.get(cacheKey);
    if (!skills) {
      skills = await prisma.skill.findMany({
        orderBy: { skill_name: "asc" }
      });
      cache.set(cacheKey, skills);
    }
    res.json(skills);
  } catch (err) {
    next(err);
  }
});

router.post("/", verifyToken, async (req, res, next) => {
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

    // Invalidate the cache
    cache.del("skills:all");

    res.status(201).json({
      message: "Skill created successfully",
      skill: newSkill
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
