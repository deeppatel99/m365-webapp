const otpRateLimit = {};
const OTP_RATE_LIMIT_WINDOW = 60 * 1000; // 1 min
const OTP_RATE_LIMIT_MAX = 3;

module.exports = (req, res, next) => {
  const email = req.body.email;
  if (!email)
    return res.status(400).json({ error: "Email required for rate limiting." });
  const now = Date.now();
  otpRateLimit[email] = otpRateLimit[email] || [];
  otpRateLimit[email] = otpRateLimit[email].filter(
    (t) => now - t < OTP_RATE_LIMIT_WINDOW
  );
  if (otpRateLimit[email].length >= OTP_RATE_LIMIT_MAX) {
    return res
      .status(429)
      .json({ error: "Too many OTP requests. Please wait a minute." });
  }
  otpRateLimit[email].push(now);
  next();
};
