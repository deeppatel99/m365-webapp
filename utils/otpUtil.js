// Utility functions for OTP generation, email sending, and domain handling

const crypto = require("crypto");
const nodemailer = require("nodemailer");
const config = require("../config");

// Generates a 6-digit OTP as a string
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit random OTP
}

// Hashes the OTP using SHA-256 for secure storage
function hashOTP(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

// Sends an OTP email to the specified address with a styled HTML body
async function sendOTPEmail(to, otp) {
  const transporter = nodemailer.createTransport({
    host: config.SMTP.host,
    port: config.SMTP.port,
    auth: {
      user: config.SMTP.user,
      pass: config.SMTP.pass,
    },
  });

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f8; padding: 32px; border-radius: 12px; max-width: 420px; margin: auto;">
      <h2 style="color: #1976d2; text-align: center; margin-bottom: 8px;">Your One-Time Passcode (OTP)</h2>
      <p style="font-size: 16px; color: #333; text-align: center; margin-bottom: 24px;">
        Use the code below to verify your email address. This code is valid for 10 minutes.
      </p>
      <div style="background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #e3e3e3; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 2.5rem; letter-spacing: 12px; color: #1976d2; font-weight: bold;">${otp}</span>
      </div>
      <p style="font-size: 15px; color: #666; text-align: center; margin-bottom: 0;">
        If you did not request this code, you can safely ignore this email.
      </p>
      <p style="font-size: 13px; color: #aaa; text-align: center; margin-top: 24px;">
        &copy; ${new Date().getFullYear()} ForSynse. All rights reserved.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: config.SMTP.user,
    to: to,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
    html,
  });
}

// Verifies if the provided OTP matches the stored hash
function verifyOTP(otp, hash) {
  return hashOTP(otp) === hash;
}

// Checks if the OTP has expired based on the expiration timestamp
function isOTPExpired(expiresAt) {
  return Date.now() > Number(expiresAt);
}

// Extracts the domain part from an email address
function extractDomain(email) {
  return email.split("@")[1];
}

// Checks if a domain is in the restrictedDomains list from config
function isRestrictedDomain(domain) {
  return config.restrictedDomains.includes(domain);
}

module.exports = {
  generateOTP, // Generate a 6-digit OTP
  hashOTP, // Hash an OTP
  sendOTPEmail, // Send an OTP email
  verifyOTP, // Verify an OTP
  isOTPExpired, // Check if OTP is expired
  extractDomain, // Extract domain from email
  isRestrictedDomain, // Check if domain is restricted
};
