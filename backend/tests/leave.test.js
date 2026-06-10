const request = require("supertest");
const app = require("../server");
const prisma = require("../src/config/db");
const jwt = require("jsonwebtoken");

jest.mock("../src/config/db", () => ({
  leaveRequest: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn()
  },
  employeeProfile: {
    findUnique: jest.fn(),
    findFirst: jest.fn()
  },
  $queryRawUnsafe: jest.fn(),
  auditLog: {
    create: jest.fn()
  },
  notification: {
    create: jest.fn()
  }
}));

const secret = process.env.JWT_SECRET || "mysecretkey";
const mockToken = jwt.sign({ id: 1, role: "user" }, secret);
const mockAdminToken = jwt.sign({ id: 2, role: "admin" }, secret);

describe("Leave Request Endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/leaves", () => {
    it("should fail validation if reason is less than 5 characters", async () => {
      const res = await request(app)
        .post("/api/v1/leaves")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({
          leaveType: "Casual Leave",
          startDate: "2026-06-15",
          endDate: "2026-06-20",
          reason: "Sho" // too short (requires min 5 chars)
        });

      expect(res.status).toBe(400);
    });

    it("should successfully apply for a leave with valid fields", async () => {
      prisma.employeeProfile.findFirst.mockResolvedValue({ id: 10, userId: 1 });
      prisma.$queryRawUnsafe.mockResolvedValue([{ balance: 30 }]);
      prisma.leaveRequest.create.mockResolvedValue({
        id: 1,
        employeeProfileId: 10,
        leaveType: "Casual Leave",
        startDate: new Date("2026-06-15"),
        endDate: new Date("2026-06-20"),
        reason: "Family vacation",
        status: "pending"
      });
      prisma.auditLog.create.mockResolvedValue({});

      const res = await request(app)
        .post("/api/v1/leaves")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({
          leaveType: "Casual Leave",
          startDate: "2026-06-15",
          endDate: "2026-06-20",
          reason: "Family vacation"
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toContain("submitted successfully");
    });
  });

  describe("PUT /api/v1/leaves/:id/reject", () => {
    it("should fail rejection if rejectionReason is too short", async () => {
      const res = await request(app)
        .put("/api/v1/leaves/1/reject")
        .set("Authorization", `Bearer ${mockAdminToken}`)
        .send({
          rejectionReason: "No" // too short (requires min 3 chars)
        });

      expect(res.status).toBe(400);
    });
  });
});
