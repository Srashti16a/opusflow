const prisma = require("../config/db");

class UserRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  async createUser(data) {
    return prisma.user.create({
      data
    });
  }

  async updateUser(id, data) {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  async findByVerificationToken(token) {
    return prisma.user.findFirst({
      where: { verificationToken: token }
    });
  }

  // Password resets
  async createResetToken(data) {
    return prisma.passwordReset.create({
      data
    });
  }

  async findResetToken(token) {
    return prisma.passwordReset.findUnique({
      where: { token }
    });
  }

  async deleteResetToken(id) {
    return prisma.passwordReset.delete({
      where: { id }
    });
  }

  async deleteExpiredResetTokens(now) {
    return prisma.passwordReset.deleteMany({
      where: {
        expiresAt: { lt: now }
      }
    });
  }

  // Refresh tokens
  async createRefreshToken(data) {
    return prisma.refreshToken.create({
      data
    });
  }

  async findRefreshToken(token) {
    return prisma.refreshToken.findUnique({
      where: { token }
    });
  }

  async deleteRefreshToken(token) {
    return prisma.refreshToken.delete({
      where: { token }
    });
  }

  // Fetch all users list
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async deleteUser(id) {
    return prisma.user.delete({
      where: { id }
    });
  }
}

module.exports = new UserRepository();
