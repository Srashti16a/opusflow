const request = require("supertest");
const app = require("../server");
const prisma = require("../src/config/db");
const jwt = require("jsonwebtoken");

jest.mock("../src/config/db", () => ({
  employeeProfile: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  employeeSkill: {
    createMany: jest.fn(),
    deleteMany: jest.fn()
  },
  employeeImage: {
    createMany: jest.fn(),
    deleteMany: jest.fn()
  },
  auditLog: {
    create: jest.fn()
  }
}));

const secret = process.env.JWT_SECRET || "mysecretkey";
const mockToken = jwt.sign({ id: 1, role: "admin" }, secret);

describe("Employee Profile Endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/employees/me", () => {
    it("should return the profile of the currently logged in user", async () => {
      const mockProfile = {
        id: 1,
        userId: 1,
        departmentId: 2,
        designation: "Senior Software Engineer",
        user: { name: "John Doe", email: "john@example.com" }
      };
      
      prisma.employeeProfile.findFirst.mockResolvedValue(mockProfile);

      const res = await request(app)
        .get("/api/v1/employees/me")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(200);
      expect(res.body.designation).toBe("Senior Software Engineer");
    });

    it("should return 404 if profile is not found", async () => {
      prisma.employeeProfile.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/v1/employees/me")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain("profile not found");
    });
  });

  describe("POST /api/v1/employees", () => {
    it("should create employee profile with valid schema validation", async () => {
      const mockNewProfile = {
        id: 2,
        userId: 3,
        departmentId: 1,
        phone: "1234567890",
        designation: "Analyst",
        salary: 50000
      };

      prisma.employeeProfile.create.mockResolvedValue(mockNewProfile);
      prisma.employeeSkill.createMany.mockResolvedValue({ count: 2 });
      prisma.employeeProfile.findUnique.mockResolvedValue(mockNewProfile);
      prisma.auditLog.create.mockResolvedValue({});

      const res = await request(app)
        .post("/api/v1/employees")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({
          userId: 3,
          departmentId: 1,
          phone: "1234567890",
          address: "123 Main St",
          designation: "Analyst",
          salary: 50000,
          skills: [1, 2]
        });

      expect(res.status).toBe(201);
      expect(res.body.profile.designation).toBe("Analyst");
    });

    it("should fail profile creation if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/v1/employees")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({
          phone: "1234567890",
          designation: "Analyst" // missing userId & departmentId
        });

      expect(res.status).toBe(400);
    });
  });
});
