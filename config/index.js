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
    signup_alert: process.env.SMTP_SIGNUP_ALERT
  },
  // List of email domains that are restricted from registering
  restrictedDomains: process.env.RESTRICTED_DOMAINS
    ? process.env.RESTRICTED_DOMAINS.split(",")
    : ["test.com", "yahoo.com"],
};
