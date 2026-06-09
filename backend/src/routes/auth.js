const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const validate = require("../middleware/validation");
const { signupSchema, loginSchema } = require("../validators/authValidator");

router.post("/signup", validate(signupSchema), UserController.signup);
router.get("/verify-email/:token", UserController.verifyEmail);
router.post("/login", validate(loginSchema), UserController.login);
router.post("/refresh-token", UserController.refreshToken);
router.post("/logout", UserController.logout);
router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password", UserController.resetPassword);

module.exports = router;
