// Service layer for authentication-related business logic
const userModel = require("../models/userModel");
const otpModel = require("../models/otpModel");
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

// Helper function to sanitize input strings
function sanitize(str) {
  return String(str || "")
    .replace(/[^a-zA-Z0-9@.\-_\'\s]/g, "")
    .trim();
}

// Helper to sanitize all fields in an object
function sanitizeFields(obj, fields) {
  const sanitized = { ...obj };
  fields.forEach((key) => {
    sanitized[key] = sanitize(obj[key]);
  });
  return sanitized;
}

// Handles user signup logic
exports.signup = async (body) => {
  // Sanitize all input fields
  const { first_name, last_name, company, email } = sanitizeFields(body, [
    "first_name",
    "last_name",
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
  const existing = await userModel.findByDomain(domain);
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
    first_name,
    last_name,
    company,
    email,
    domain,
    created_at: new Date().toISOString(),
    querycount: 0,
    querymax: 10,
    verified: "false",
  };
  await userModel.create(user);

  // Generate and send OTP for verification
  const otp = generateOTP();
  const hashed = hashOTP(otp);
  const otpRecord = {
    email,
    otp: hashed,
    expires_at: Date.now() + 10 * 60 * 1000, // OTP valid for 10 minutes
  };
  await otpModel.create(otpRecord);
  await emailService.sendOTPEmail(email, otp); // Uncomment to enable email

  // Send signup alert email after successful verification
  if (user) {
    await emailService.sendSignupAlert(user);
  }

  return { message: "User registered. OTP sent." };
};

// Handles sending OTP to a user
exports.sendOtp = async (body) => {
  const { email } = sanitizeFields(body, ["email"]);
  const otp = generateOTP();
  const hashed = hashOTP(otp);
  const otpRecord = {
    email,
    otp: hashed,
    expires_at: Date.now() + 10 * 60 * 1000,
  };
  await otpModel.create(otpRecord);
  await emailService.sendOTPEmail(email, otp);
  return { message: "OTP sent" };
};

// Handles OTP verification
exports.verifyOtp = async (body) => {
  const { email, otp } = sanitizeFields(body, ["email", "otp"]);
  const otpEntry = await otpModel.findLatestByEmail(email);
  if (!otpEntry) {
    const err = new Error("No OTP found for this email.");
    err.status = 400;
    throw err;
  }
  if (isOTPExpired(otpEntry.expires_at)) {
    const err = new Error("OTP expired.");
    err.status = 400;
    throw err;
  }
  if (!verifyOTP(otp, otpEntry.otp)) {
    const err = new Error("Invalid OTP.");
    err.status = 400;
    throw err;
  }
  await userModel.updateByEmail(email, { verified: "true" });
  return { message: "OTP verified. Access granted." };
};

// Handles login logic (sends OTP for login)
exports.login = async (body) => {
  const { email } = sanitizeFields(body, ["email"]);
  const user = await userModel.findByEmail(email);
  if (!user) {
    const err = new Error("User not found. Please sign up.");
    err.status = 404;
    throw err;
  }
  const otp = generateOTP();
  const hashed = hashOTP(otp);
  const otpRecord = {
    email,
    otp: hashed,
    expires_at: Date.now() + 10 * 60 * 1000,
  };
  await otpModel.create(otpRecord);
  await emailService.sendOTPEmail(email, otp);
  return { message: "OTP sent for login." };
};

// Checks if a domain already has a registered user
exports.checkDomain = async (query) => {
  const { email } = sanitizeFields(query, ["email"]);
  const domain = extractDomain(email);
  const exists = !!(await userModel.findByDomain(domain));
  return { exists };
};
