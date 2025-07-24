// Service layer for dashboard-related business logic
const UserModel = require("../models/userModel");
const { sanitizeFields } = require("../utils/sanitize");

// Handles dashboard query execution with queryCount increment and lockout check
exports.executeQuery = async (body) => {
  const { email, action } = sanitizeFields(body, ["email", "action"]);
  
  // Find user by email
  const user = await UserModel.findByEmail(email);
  if (!user) {
    const err = new Error("User not found. Please sign up.");
    err.status = 404;
    throw err;
  }

  // Check if user is already locked out
  if (UserModel.isUserLocked(user)) {
    const err = new Error(
      "Your account has reached the maximum execution limits. Please reach out to support@forsynse.com for assistance."
    );
    err.status = 403;
    throw err;
  }

  // Increment queryCount before executing the query
  const { queryCount } = await UserModel.incrementQueryCount(email);
  
  // Check if user is now locked after incrementing
  if (UserModel.isUserLocked({ ...user, queryCount })) {
    const err = new Error(
      "Your account has reached the maximum execution limits. Please reach out to support@forsynse.com for assistance."
    );
    err.status = 403;
    throw err;
  }

  // Return success response (the actual query execution happens on frontend via Microsoft Graph)
  return { 
    message: "Query execution authorized", 
    queryCount,
    queryMax: user.queryMax 
  };
};