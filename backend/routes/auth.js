const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../config/db");

// Helper: Determine role based on email domain to aid manual testing
function getRoleByEmail(email) {
  const normalized = email.toLowerCase().trim();
  if (normalized.endsWith("@admin.com")) return "admin";
  if (normalized.endsWith("@manager.com")) return "manager";
  return "user";
}

// 1. Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExist = await prisma.user.findUnique({
      where: { email }
    });

    if (userExist) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const role = getRoleByEmail(email);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        verified: false,
        verificationToken
      }
    });

    // Simulate sending email by logging to the console
    const verificationLink = `http://localhost:5173/verify/${verificationToken}`;
    console.log(`\n========================================`);
    console.log(`✉️  EMAIL SENT TO: ${email}`);
    console.log(`Welcome to Isoft EventHub 360, ${name}!`);
    console.log(`Please verify your email using the link below:`);
    console.log(`${verificationLink}`);
    console.log(`========================================\n`);

    res.status(201).json({
      message: "Registration successful! Please check the server console for your email verification link.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        verified: newUser.verified
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// 2. Email Verification Route
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        verificationToken: null
      }
    });

    res.json({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// 3. Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Verify Password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check Verification Status
    if (!user.verified) {
      return res.status(403).json({
        message: "Please verify your email first. Check the server console for your verification link."
      });
    }

    // Generate JWT Access Token (15 min)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Generate JWT Refresh Token (30 days)
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    // Store Refresh Token in DB
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken
      }
    });

    res.json({
      message: "Login successful",
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// 4. Refresh Token Route
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    try {
      // Verify Refresh Token signature and expiry
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Generate new Access Token (15 min)
      const newAccessToken = jwt.sign(
        { id: storedToken.user.id, email: storedToken.user.email, role: storedToken.user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ token: newAccessToken });
    } catch (err) {
      // Token expired or invalid, remove from database
      await prisma.refreshToken.delete({
        where: { token: refreshToken }
      });
      return res.status(401).json({ message: "Refresh token expired. Please log in again." });
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// 5. Logout Route
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Delete the refresh token from database if it exists
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      });
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// 6. Forgot Password Route
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Standard security: don't reveal if user doesn't exist
      return res.json({ message: "If that email exists in our database, a password reset link has been logged to the console." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Save reset token in DB
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt
      }
    });

    // Simulate sending email by logging to the console
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    console.log(`\n========================================`);
    console.log(`✉️  PASSWORD RESET EMAIL FOR: ${email}`);
    console.log(`Click the link below to reset your password (valid for 15 minutes):`);
    console.log(`${resetLink}`);
    console.log(`========================================\n`);

    res.json({ message: "A password reset link has been logged to the server console." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// 7. Reset Password Route
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    const resetRequest = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetRequest || resetRequest.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired password reset token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await prisma.user.update({
      where: { id: resetRequest.userId },
      data: { password: hashedPassword }
    });

    // Delete the used reset token (and any other reset tokens for this user)
    await prisma.passwordReset.deleteMany({
      where: { userId: resetRequest.userId }
    });

    // Delete refresh tokens for the user to force re-login on all devices (security best practice)
    await prisma.refreshToken.deleteMany({
      where: { userId: resetRequest.userId }
    });

    res.json({ message: "Password has been reset successfully! You can now log in with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

module.exports = router;
