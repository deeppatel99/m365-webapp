const path = require("path");
const {
  readCSV,
  appendCSV,
  findRecord,
  updateRecord,
} = require("../utils/csvUtil");

// Path to the users CSV file
const usersFile = path.join(__dirname, "../data/users.csv");

// Find a user by email (case-insensitive, trimmed)
exports.findByEmail = async (email) => {
  const users = await readCSV(usersFile);
  return users.find(
    (user) =>
      user.email &&
      user.email.trim().toLowerCase() === email.trim().toLowerCase()
  );
};

// Find a user by domain
exports.findByDomain = async (domain) => {
  const users = await readCSV(usersFile);
  return users.find((user) => user.domain === domain);
};

// Create a new user
exports.create = async (user) => {
  await appendCSV(usersFile, user);
};

// Update a user by email
exports.updateByEmail = async (email, updateObj) => {
  return await updateRecord(usersFile, "email", email, updateObj);
};

// Increment querycount and lock user if needed
exports.incrementQueryCount = async (email) => {
  const user = await exports.findByEmail(email);
  if (!user) return null;
  let querycount = parseInt(user.querycount || "0", 10) + 1;
  let querymax = parseInt(user.querymax || "3", 10);
  await exports.updateByEmail(email, {
    querycount,
  });
  return { querycount };
};

// Get all users
exports.getAll = async () => {
  return await readCSV(usersFile);
};

// Helper to check if user is locked out
exports.isUserLocked = (user) => {
  if (!user) return true;
  const querycount = parseInt(user.querycount || "0", 10);
  const querymax = parseInt(user.querymax || "3", 10);
  return querycount >= querymax;
};
