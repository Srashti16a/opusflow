const request = require("supertest");
const app = require("../server");
const prisma = require("../src/config/db");
const bcrypt = require("bcrypt");

jest.mock("../src/config/db", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn()
  },
  refreshToken: {
    create: jest.fn(),
    delete: jest.fn()
  }
}));

describe("Auth Endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/auth/signup", () => {
    it("should fail validation if name is less than 3 characters", async () => {
      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          name: "Ab",
          email: "test@example.com",
          password: "password123"
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Validation failed");
    });

    it("should register a user successfully with valid inputs", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 1,
        name: "Test User",
        email: "test@example.com",
        role: "user",
        verified: false
      });

      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123"
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toContain("Registration successful");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should authenticate and return tokens for correct credentials", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
        role: "user",
        verified: true
      });
      prisma.refreshToken.create.mockResolvedValue({ token: "refreshtoken123" });

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "test@example.com",
          password: "password123"
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("refreshToken");
    });

    it("should fail authentication if email is not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123"
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Invalid email or password");
    });
  });
});
