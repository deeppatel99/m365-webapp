// Configuration file for backend settings
// Loads environment variables and exports configuration for use throughout the backend

require("dotenv").config();

module.exports = {
  // Port for the backend server
  PORT: process.env.PORT || 3005,
  // SMTP configuration for sending emails (e.g., OTPs)
  SMTP: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    signup_alert: process.env.SMTP_SIGNUP_ALERT,
  },
  // List of email domains that are restricted from registering
  restrictedDomains: process.env.RESTRICTED_DOMAINS
    ? process.env.RESTRICTED_DOMAINS.split(",")
    : ["test.com", "yahoo.com"],

  // Timeouts for rate limiting and other operations
  timeouts: {
    // OTP expiration time in milliseconds (default: 10 minutes)
    otpExpiration:
      parseInt(process.env.OTP_EXPIRATION_MS, 10) || 10 * 60 * 1000,

    // Cooldown period for resending OTPs in milliseconds (default: 3 minutes)
    otpResendCooldown:
      parseInt(process.env.OTP_RESEND_COOLDOWN_MS, 3) || 3 * 60 * 1000,

    // Time window for rate limiting in milliseconds (default: 1 minute)
    rateLimiterWindow:
      parseInt(process.env.RATE_LIMITER_WINDOW_MS, 1) || 1 * 60 * 1000,
    // Maximum number of requests allowed within the rate limiting window (default: 3)
    rateLimiterMaxRequests:
      parseInt(process.env.RATE_LIMITER_MAX_REQUESTS, 3) || 3,
  },
};
