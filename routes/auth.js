// Import required modules and middlewares
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const validate = require("../middlewares/validate");
const rateLimiter = require("../middlewares/rateLimiter");
const {
  signupSchema,
  sendOtpSchema,
  verifyOtpSchema,
  loginSchema,
} = require("../validations/authValidation");

// User signup route
router.post("/signup", validate(signupSchema), authController.signup);

// Send OTP route (rate-limited)
router.post(
  "/send-otp",
  rateLimiter, // Prevent abuse by limiting requests
  validate(sendOtpSchema),
  authController.sendOtp
);

// Verify OTP route
router.post("/verify-otp", validate(verifyOtpSchema), authController.verifyOtp);

// User login route
router.post("/login", validate(loginSchema), authController.login);

// Check if a domain already has a registered user
router.get("/check-domain", authController.checkDomain);

// Fetch user details by email
router.get("/user", authController.getUserByEmail);

// Fetch OTP user details by email (first layer only)
router.get("/otp-user", authController.getOtpUserByEmail);

module.exports = router;
