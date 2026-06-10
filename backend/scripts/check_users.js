const prisma = require("../config/db");

async function check() {
  try {
    const users = await prisma.user.findMany();
    console.log("Users in DB:", JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
