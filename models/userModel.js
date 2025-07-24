const path = require("path");
const {
  readCSV,
  appendCSV,
  findRecord,
  updateRecord,
} = require("../utils/csvUtil");

const usersFile = path.join(__dirname, "../data/users.csv");

class UserModel {
  static async findByEmail(email) {
    const users = await readCSV(usersFile);
    return users.find(
      (user) =>
        user.email &&
        user.email.trim().toLowerCase() === email.trim().toLowerCase()
    );
  }

  static async findByDomain(domain) {
    const users = await readCSV(usersFile);
    return users.find((user) => user.domain === domain);
  }

  static async create(user) {
    await appendCSV(usersFile, user);
  }

  static async updateByEmail(email, updateObj) {
    return await updateRecord(usersFile, "email", email, updateObj);
  }

  static async incrementQueryCount(email) {
    const user = await UserModel.findByEmail(email);
    if (!user) return null;
    let queryCount = parseInt(user.queryCount || "0", 10) + 1;
    let queryMax = parseInt(user.queryMax || "3", 10);
    await UserModel.updateByEmail(email, {
      queryCount,
    });
    return { queryCount };
  }

  static async getAll() {
    return await readCSV(usersFile);
  }

  static isUserLocked(user) {
    if (!user) return true;
    const queryCount = parseInt(user.queryCount || "0", 10);
    const queryMax = parseInt(user.queryMax || "4", 10);
    return queryCount >= queryMax;
  }
}

module.exports = UserModel;
