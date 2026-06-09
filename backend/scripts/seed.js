const prisma = require("../config/db");
const bcrypt = require("bcrypt");

async function main() {
  console.log("Seeding database departments, skills, and users...");

  // Seed Departments
  const departments = ["IT", "HR", "Finance", "Marketing"];
  for (const dept of departments) {
    const existing = await prisma.department.findFirst({
      where: { department_name: dept }
    });
    if (!existing) {
      await prisma.department.create({
        data: { department_name: dept }
      });
      console.log(`Created department: ${dept}`);
    }
  }

  // Seed Skills
  const skills = ["React", "NodeJS", "PostgreSQL", "Python", "Java"];
  for (const skill of skills) {
    const existing = await prisma.skill.findFirst({
      where: { skill_name: skill }
    });
    if (!existing) {
      await prisma.skill.create({
        data: { skill_name: skill }
      });
      console.log(`Created skill: ${skill}`);
    }
  }

  // Seed Users
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("Password123", salt);

  // Admin User
  const adminEmail = "admin@admin.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Admin User",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        verified: true
      }
    });
    console.log(`Created admin user: ${adminEmail}`);
  }

  // Regular User
  const userEmail = "tester@example.com";
  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail }
  });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        name: "Test User",
        email: userEmail,
        password: hashedPassword,
        role: "user",
        verified: true
      }
    });
    console.log(`Created regular user: ${userEmail}`);
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch (err) {
      // Ignore disconnect errors
    }
  });
