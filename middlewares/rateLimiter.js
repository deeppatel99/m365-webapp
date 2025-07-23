const config = require("../config");

class RateLimiter {
  constructor({ windowMs = 60 * 1000, max = 3 } = {}) {
    this.windowMs = windowMs;
    this.max = max;
    this.requests = {};
  }

  middleware = (req, res, next) => {
    const email = req.body.email;
    if (!email)
      return res
        .status(400)
        .json({ error: "Email required for rate limiting." });
    const now = Date.now();
    this.requests[email] = this.requests[email] || [];
    this.requests[email] = this.requests[email].filter(
      (t) => now - t < this.windowMs
    );
    if (this.requests[email].length >= this.max) {
      return res
        .status(429)
        .json({ error: "Too many OTP requests. Please wait a minute." });
    }
    this.requests[email].push(now);
    next();
  };
}

const otpRateLimiter = new RateLimiter({ 
  windowMs: config.timeouts.rateLimiterWindow, 
  max: config.timeouts.rateLimiterMaxRequests 
});
module.exports = otpRateLimiter.middleware;
