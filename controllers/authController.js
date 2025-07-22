const authService = require("../services/authService");
const userModel = require("../models/userModel");

// Handle user signup requests
exports.signup = async (req, res) => {
  try {
    const result = await authService.signup(req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Handle sending OTP requests
exports.sendOtp = async (req, res) => {
  try {
    const result = await authService.sendOtp(req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Handle OTP verification requests
exports.verifyOtp = async (req, res) => {
  try {
    const result = await authService.verifyOtp(req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Handle user login requests
exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Handle domain check requests
exports.checkDomain = async (req, res) => {
  try {
    const result = await authService.checkDomain(req.query);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// Fetch user details by email
exports.getUserByEmail = async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const user = await userModel.findByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch OTP user details by email (first layer only)
exports.getOtpUserByEmail = async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const user = await userModel.findByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });
    // Only return first_name, last_name, company, email, verified
    const { first_name, last_name, company, email: userEmail, verified } = user;
    res.json({ first_name, last_name, company, email: userEmail, verified });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
