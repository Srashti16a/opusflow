const prisma = require("../config/db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function testLeaveEndpoints() {
  console.log("Testing leave endpoints directly via repository...\n");

  const LeaveRepository = require("../src/repositories/LeaveRepository");
  const EmployeeRepository = require("../src/repositories/EmployeeRepository");
  
  // Test 1: Get pending requests
  console.log("=== TEST 1: findPending() ===");
  const pending = await LeaveRepository.findPending();
  console.log(`Found ${pending.length} pending leaves:`);
  pending.forEach(r => {
    console.log(`  - ID: ${r.id}, Employee: ${r.employeeProfile?.user?.name}, LeaveType: ${r.leaveType}, Start: ${r.startDate}, End: ${r.endDate}`);
  });

  // Test 2: Get history
  console.log("\n=== TEST 2: findHistory() ===");
  const history = await LeaveRepository.findHistory();
  console.log(`Found ${history.length} processed leaves:`);
  history.forEach(r => {
    console.log(`  - ID: ${r.id}, Employee: ${r.employeeProfile?.user?.name}, LeaveType: ${r.leaveType}, Status: ${r.status}`);
  });

  // Test 3: Get my requests for pranay (user id 5, but pranay is admin so check their employee profile)
  console.log("\n=== TEST 3: Employee profiles linked to admin (pranay user id=5) ===");
  const pranayProfile = await EmployeeRepository.findByUserId(5);
  console.log("Pranay employee profile:", JSON.stringify(pranayProfile, null, 2));
  
  await prisma.$disconnect();
}

testLeaveEndpoints().catch(e => {
  console.error("Error:", e);
  process.exit(1);
});
