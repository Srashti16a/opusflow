const prisma = require("../config/db");

async function check() {
  try {
    const appsCount = await prisma.leaveApplication.count();
    const reqsCount = await prisma.leaveRequest.count();
    console.log("Leave Application count:", appsCount);
    console.log("Leave Request count:", reqsCount);
    
    if (appsCount > 0) {
      const apps = await prisma.leaveApplication.findMany({
        include: {
          employeeProfile: {
            include: {
              user: true,
              department: true
            }
          },
          leaveType: true
        }
      });
      console.log("Applications detail:", JSON.stringify(apps, null, 2));
    }
  } catch (err) {
    console.error("Error checking leaves:", err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
