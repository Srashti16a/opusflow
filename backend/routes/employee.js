const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const verifyToken = require("../middleware/auth");
const upload = require("../config/multer");

// 1. Dashboard Statistics
router.get("/dashboard/stats", verifyToken, async (req, res) => {
  try {
    const totalEmployees = await prisma.employeeProfile.count();
    const totalDepartments = await prisma.department.count();
    const totalSkills = await prisma.skill.count();
    const totalImages = await prisma.employeeImage.count();

    res.json({
      employees: totalEmployees,
      departments: totalDepartments,
      skills: totalSkills,
      images: totalImages
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to load dashboard statistics" });
  }
});

// 2. SQL JOIN Assignments
router.get("/queries/joins", verifyToken, async (req, res) => {
  try {
    const join1 = await prisma.$queryRawUnsafe(`
      SELECT
        u.name,
        d.department_name
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      INNER JOIN departments d ON ep.department_id = d.id;
    `);

    const join2 = await prisma.$queryRawUnsafe(`
      SELECT
        u.name,
        s.skill_name
      FROM employee_skills es
      INNER JOIN employee_profiles ep ON es.employee_id = ep.id
      INNER JOIN users u ON ep.user_id = u.id
      INNER JOIN skills s ON es.skill_id = s.id;
    `);

    res.json({ join1, join2 });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to execute database join queries" });
  }
});

// 3. Upload Multi-images (Up to 5 images)
router.post("/upload", verifyToken, (req, res) => {
  // Handle multer error if limit exceeded
  const uploadHandler = upload.array("images", 5);
  uploadHandler(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ imageUrls });
  });
});

// 4. Create Employee Profile
router.post("/", verifyToken, async (req, res) => {
  const { userId, departmentId, phone, address, designation, salary, skills, imageUrls } = req.body;

  try {
    const profile = await prisma.employeeProfile.create({
      data: {
        userId: userId ? parseInt(userId) : null,
        departmentId: departmentId ? parseInt(departmentId) : null,
        phone,
        address,
        designation,
        salary: salary ? parseFloat(salary) : null,
      }
    });

    if (skills && Array.isArray(skills)) {
      await prisma.employeeSkill.createMany({
        data: skills.map(skillId => ({
          employeeId: profile.id,
          skillId: parseInt(skillId)
        }))
      });
    }

    if (imageUrls && Array.isArray(imageUrls)) {
      await prisma.employeeImage.createMany({
        data: imageUrls.map(url => ({
          employeeId: profile.id,
          imageUrl: url
        }))
      });
    }

    res.status(201).json({
      message: "Employee profile created successfully",
      profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create profile" });
  }
});

// 5. GET all employees
router.get("/", verifyToken, async (req, res) => {
  try {
    const employees = await prisma.employeeProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: true,
        images: true,
        employeeSkills: {
          include: {
            skill: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch employees" });
  }
});

// 6. GET employee by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const employee = await prisma.employeeProfile.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: true,
        images: true,
        employeeSkills: {
          include: {
            skill: true
          }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch employee" });
  }
});

// 7. Update Employee Profile
router.put("/:id", verifyToken, async (req, res) => {
  const { userId, departmentId, phone, address, designation, salary, skills, imageUrls } = req.body;
  const id = parseInt(req.params.id);

  try {
    // 1. Update basic info
    await prisma.employeeProfile.update({
      where: { id },
      data: {
        userId: userId ? parseInt(userId) : null,
        departmentId: departmentId ? parseInt(departmentId) : null,
        phone,
        address,
        designation,
        salary: salary ? parseFloat(salary) : null,
      }
    });

    // 2. Update Skills
    await prisma.employeeSkill.deleteMany({
      where: { employeeId: id }
    });

    if (skills && Array.isArray(skills)) {
      await prisma.employeeSkill.createMany({
        data: skills.map(skillId => ({
          employeeId: id,
          skillId: parseInt(skillId)
        }))
      });
    }

    // 3. Update Images
    await prisma.employeeImage.deleteMany({
      where: { employeeId: id }
    });

    if (imageUrls && Array.isArray(imageUrls)) {
      await prisma.employeeImage.createMany({
        data: imageUrls.map(url => ({
          employeeId: id,
          imageUrl: url
        }))
      });
    }

    res.json({ message: "Employee profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update employee profile" });
  }
});

// 8. Delete Employee Profile
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await prisma.employeeProfile.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: "Employee profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete employee profile" });
  }
});

module.exports = router;
