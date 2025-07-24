// Service layer for authentication-related business logic
const UserModel = require("../models/userModel");
const OtpModel = require("../models/otpModel");
const { generateUserId } = require("../utils/csvUtil");
const {
  generateOTP,
  hashOTP,
  verifyOTP,
  isOTPExpired,
  extractDomain,
  isRestrictedDomain,
} = require("../utils/otpUtil");
const emailService = require("./emailService");
const { sanitize, sanitizeFields } = require("../utils/sanitize");
const config = require("../config");

const otpCooldowns = new Map();

// Handles user signup logic
exports.signup = async (body) => {
  // Sanitize all input fields
  const { firstName, lastName, company, email } = sanitizeFields(body, [
    "firstName",
    "lastName",
    "company",
    "email",
  ]);

  // Extract domain from email
  const domain = extractDomain(email);
  // Check if the domain is restricted
  if (isRestrictedDomain(domain)) {
    const err = new Error(
      "Registration from this email domain is not allowed."
    );
    err.status = 403;
    throw err;
  }
  // Check if a user from this domain already exists
  const existing = await UserModel.findByDomain(domain);
  if (existing) {
    const err = new Error(
      "A user from your company has already registered. Please contact support."
    );
    err.status = 403;
    throw err;
  }

  // Create new user object
  const user = {
    id: generateUserId(),
    firstName,
    lastName,
    company,
    email,
    domain,
    createdAt: new Date().toISOString(),
    queryCount: 0,
    queryMax: 4,
    verified: false,
  };
  await UserModel.create(user);

  // Generate and send OTP for verification
  const otp = generateOTP();
  const hashed = hashOTP(otp);
  const otpRecord = {
    email,
    otp: hashed,
    expiresAt: Date.now() + config.timeouts.otpExpiration,
  };
  await OtpModel.create(otpRecord);
  await emailService.sendOTPEmail(email, otp);

  // Send signup alert email after successful verification
  if (user) {
    await emailService.sendSignupAlert(user);
  }

  return { message: "User registered. OTP sent." };
};

// Handles sending OTP to a user along with resend logic
exports.sendOtp = async (body) => {
  const { email } = sanitizeFields(body, ["email"]);
  const user = await UserModel.findByEmail(email);
  if (!user) {
    const err = new Error("User not found. Please sign up.");
    err.status = 404;
    throw err;
  }
  if (UserModel.isUserLocked(user)) {
    const err = new Error(
      "Your account has reached the maximum execution limits. Please reach out to support@forsynse.com for assistance."
    );
    err.status = 403;
    throw err;
  }
  // Enforce resend cooldown
  const now = Date.now();
  const lastSent = otpCooldowns.get(email) || 0;
  if (now - lastSent < config.timeouts.otpResendCooldown) {
    const err = new Error(
      "Please wait before resending OTP. Try again in a few minutes."
    );
    err.status = 429;
    throw err;
  }
  // Increment querycount
  const { queryCount } = await UserModel.incrementQueryCount(email);
  if (UserModel.isUserLocked({ ...user, queryCount })) {
    const err = new Error(
      "Your account has reached the maximum execution limits. Please reach out to support@forsynse.com for assistance."
    );
    err.status = 403;
    throw err;
  }
  // Send OTP
  const otp = generateOTP();
  const hashed = hashOTP(otp);
  const otpRecord = {
    email,
    otp: hashed,
    expiresAt: Date.now() + config.timeouts.otpExpiration,
  };
  await OtpModel.create(otpRecord);
  await emailService.sendOTPEmail(email, otp);
  otpCooldowns.set(email, now);
  return { message: "OTP sent" };
};

// Handles OTP verification
exports.verifyOtp = async (body) => {
  const { email, otp } = sanitizeFields(body, ["email", "otp"]);
  const user = await UserModel.findByEmail(email);
  if (!user) {
    const err = new Error("User not found. Please sign up.");
    err.status = 404;
    throw err;
  }
  if (UserModel.isUserLocked(user)) {
    const err = new Error(
      "Your account has reached the maximum execution limits. Please reach out to support@forsynse.com for assistance."
    );
    err.status = 403;
    throw err;
  }
  const otpEntry = await OtpModel.findLatestByEmail(email);
  if (!otpEntry) {
    const err = new Error("No OTP found for this email.");
    err.status = 400;
    throw err;
  }
  if (isOTPExpired(otpEntry.expiresAt)) {
    const err = new Error("OTP expired.");
    err.status = 400;
    throw err;
  }
  if (!verifyOTP(otp, otpEntry.otp)) {
    const err = new Error("Invalid OTP.");
    err.status = 400;
    throw err;
  }
  await UserModel.updateByEmail(email, { verified: true, queryCount: 0 });
  return { message: "OTP verified. Access granted." };
};

// Handles login logic (sends OTP for login)
exports.login = async (body) => {
  const { email } = sanitizeFields(body, ["email"]);
  const user = await UserModel.findByEmail(email);
  if (!user) {
    const err = new Error("User not found. Please sign up.");
    err.status = 404;
    throw err;
  }
  if (UserModel.isUserLocked(user)) {
    const err = new Error(
      "Your account has reached the maximum execution limits. Please reach out to support@forsynse.com for assistance."
    );
    err.status = 403;
    throw err;
  }
  const otp = generateOTP();
  const hashed = hashOTP(otp);
  const otpRecord = {
    email,
    otp: hashed,
    expiresAt: Date.now() + config.timeouts.otpExpiration,
  };
  await OtpModel.create(otpRecord);
  await emailService.sendOTPEmail(email, otp);
  return { message: "OTP sent for login." };
};

// Checks if a domain already has a registered user
exports.checkDomain = async (query) => {
  const { email } = sanitizeFields(query, ["email"]);
  const domain = extractDomain(email);
  const exists = !!(await UserModel.findByDomain(domain));
  return { exists };
};
