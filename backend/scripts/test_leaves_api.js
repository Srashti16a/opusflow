const prisma = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function getAdminToken() {
  // Get pranay admin user
  const user = await prisma.user.findUnique({
    where: { email: "pranay@isoftzone.com" }
  });
  
  if (!user) {
    console.log("ERROR: pranay@isoftzone.com not found in DB!");
    return null;
  }

  const secret = process.env.JWT_SECRET;
  const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: "1h" });
  console.log(`Admin token for pranay (id=${user.id}, role=${user.role}):`);
  console.log(token);
  return token;
}

async function testLeavesAPI(token) {
  const https = require("http");
  
  const makeRequest = (path) => new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path,
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    };
    
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on("error", reject);
    req.end();
  });

  console.log("\n=== GET /api/v1/leaves/pending ===");
  const pending = await makeRequest("/api/v1/leaves/pending");
  console.log(`Status: ${pending.status}, Records: ${pending.body.length}`);
  if (pending.body.length > 0) {
    const first = pending.body[0];
    console.log("First record fields:", {
      id: first.id,
      leaveType: first.leaveType,
      startDate: first.startDate,
      endDate: first.endDate,
      reason: first.reason,
      status: first.status,
      employeeName: first.employeeProfile?.user?.name,
      department: first.employeeProfile?.department?.department_name
    });
  }

  console.log("\n=== GET /api/v1/leaves/history ===");
  const history = await makeRequest("/api/v1/leaves/history");
  console.log(`Status: ${history.status}, Records: ${history.body.length}`);
  if (history.body.length > 0) {
    const first = history.body[0];
    console.log("First record fields:", {
      id: first.id,
      leaveType: first.leaveType,
      startDate: first.startDate,
      endDate: first.endDate,
      status: first.status,
      rejectionReason: first.rejectionReason,
      employeeName: first.employeeProfile?.user?.name
    });
  }
}

async function main() {
  const token = await getAdminToken();
  if (token) {
    await testLeavesAPI(token);
  }
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
