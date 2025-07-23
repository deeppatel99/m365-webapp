const path = require("path");
const { readCSV, appendCSV } = require("../utils/csvUtil");

const otpsFile = path.join(__dirname, "../data/otps.csv");

class OtpModel {
  static async create(otpRecord) {
    await appendCSV(otpsFile, otpRecord);
  }

  static async findLatestByEmail(email) {
    const otps = await readCSV(otpsFile);
    return otps.reverse().find((o) => o.email === email);
  }
}

module.exports = OtpModel;
