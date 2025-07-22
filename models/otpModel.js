const path = require("path");
const { readCSV, appendCSV } = require("../utils/csvUtil");

// Path to the OTPs CSV file
const otpsFile = path.join(__dirname, "../data/otps.csv");

// Create a new OTP record
exports.create = async (otpRecord) => {
  await appendCSV(otpsFile, otpRecord);
};

// Find the latest OTP by email
exports.findLatestByEmail = async (email) => {
  const otps = await readCSV(otpsFile);
  return otps.reverse().find((o) => o.email === email);
};
