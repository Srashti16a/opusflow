const UserService = require("../services/UserService");

class UserController {
  async signup(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const user = await UserService.signup(name, email, password);
      res.status(201).json({
        message: "Registration successful! Please check the server console for your email verification link.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          verified: user.verified
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.params;
      const result = await UserService.verifyEmail(token);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await UserService.login(email, password);
      res.json({
        message: "Login successful",
        token: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user
      });
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token is required" });
      }
      const newAccessToken = await UserService.refresh(refreshToken);
      res.json({ token: newAccessToken });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await UserService.logout(refreshToken);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await UserService.forgotPassword(email);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const result = await UserService.resetPassword(token, newPassword);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const result = await UserService.deleteUser(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
