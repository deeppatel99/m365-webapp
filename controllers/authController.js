const authService = require("../services/authService");
const UserModel = require("../models/userModel");

// Handle user signup requests
exports.signup = async (req, res, next) => {
  try {
    const result = await authService.signup(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Handle sending OTP requests
exports.sendOtp = async (req, res, next) => {
  try {
    const result = await authService.sendOtp(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Handle OTP verification requests
exports.verifyOtp = async (req, res, next) => {
  try {
    const result = await authService.verifyOtp(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Handle user login requests
exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Handle domain check requests
exports.checkDomain = async (req, res, next) => {
  try {
    const result = await authService.checkDomain(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Fetch user details by email
exports.getUserByEmail = async (req, res, next) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const user = await UserModel.findByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Fetch OTP user details by email (first layer only)
exports.getOtpUserByEmail = async (req, res, next) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const user = await UserModel.findByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });
    // Only return firstName, lastName, company, email, verified
    const { firstName, lastName, company, email: userEmail, verified } = user;
    res.json({ firstName, lastName, company, email: userEmail, verified });
  } catch (err) {
    next(err);
  }
};
