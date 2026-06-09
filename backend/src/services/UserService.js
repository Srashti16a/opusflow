const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const UserRepository = require("../repositories/UserRepository");

function getRoleByEmail(email) {
  const normalized = email.toLowerCase().trim();
  if (normalized.endsWith("@admin.com")) return "admin";
  if (normalized.endsWith("@manager.com")) return "manager";
  return "user";
}

class UserService {
  async signup(name, email, password) {
    const userExist = await UserRepository.findByEmail(email);
    if (userExist) {
      const error = new Error("Email already exists");
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const role = getRoleByEmail(email);

    const newUser = await UserRepository.createUser({
      name,
      email,
      password: hashedPassword,
      role,
      verified: false,
      verificationToken
    });

    // Log verification link
    const verificationLink = `http://localhost:5173/verify/${verificationToken}`;
    console.log(`\n========================================`);
    console.log(`✉️  EMAIL SENT TO: ${email}`);
    console.log(`Welcome to Isoft EventHub 360, ${name}!`);
    console.log(`Please verify your email using the link below:`);
    console.log(`${verificationLink}`);
    console.log(`========================================\n`);

    return newUser;
  }

  async verifyEmail(token) {
    const user = await UserRepository.findByVerificationToken(token);
    if (!user) {
      const error = new Error("Invalid or expired verification token");
      error.statusCode = 400;
      throw error;
    }

    await UserRepository.updateUser(user.id, {
      verified: true,
      verificationToken: null
    });

    return { message: "Email verified successfully!" };
  }

  async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 400;
      throw error;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      const error = new Error("Invalid email or password");
      error.statusCode = 400;
      throw error;
    }

    if (!user.verified) {
      const error = new Error("Please verify your email first. Check the server console for your verification link.");
      error.statusCode = 403;
      throw error;
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    await UserRepository.createRefreshToken({
      userId: user.id,
      token: refreshToken
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  async refresh(token) {
    const storedToken = await UserRepository.findRefreshToken(token);
    if (!storedToken) {
      const error = new Error("Invalid refresh token");
      error.statusCode = 401;
      throw error;
    }

    try {
      jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      
      const newAccessToken = jwt.sign(
        { id: storedToken.userId, email: storedToken.user.email, role: storedToken.user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      return newAccessToken;
    } catch (err) {
      await UserRepository.deleteRefreshToken(token);
      const error = new Error("Refresh token expired. Please log in again.");
      error.statusCode = 401;
      throw error;
    }
  }

  async logout(token) {
    if (token) {
      await UserRepository.deleteRefreshToken(token);
    }
    return { message: "Logged out successfully" };
  }

  async forgotPassword(email) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return { message: "If that email exists in our database, a password reset link has been logged to the console." };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await UserRepository.createResetToken({
      userId: user.id,
      token: resetToken,
      expiresAt
    });

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    console.log(`\n========================================`);
    console.log(`✉️  PASSWORD RESET EMAIL FOR: ${email}`);
    console.log(`Click the link below to reset your password (valid for 15 minutes):`);
    console.log(`${resetLink}`);
    console.log(`========================================\n`);

    return { message: "A password reset link has been logged to the server console." };
  }

  async resetPassword(token, newPassword) {
    const resetRequest = await UserRepository.findResetToken(token);
    if (!resetRequest || resetRequest.expiresAt < new Date()) {
      const error = new Error("Invalid or expired password reset token");
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await UserRepository.updateUser(resetRequest.userId, {
      password: hashedPassword
    });

    await UserRepository.deleteResetToken(resetRequest.id);

    return { message: "Password has been reset successfully! You can now log in." };
  }

  async getAllUsers() {
    return UserRepository.findAll();
  }

  async deleteUser(id) {
    return UserRepository.deleteUser(id);
  }
}

module.exports = new UserService();
