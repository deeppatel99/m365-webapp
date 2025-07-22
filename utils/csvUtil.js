const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

// Parse CSV content into an array of objects
function parseCSV(content) {
  const [header, ...lines] = content.trim().split("\n");
  const keys = header.split(",");
  return lines.map((line) => {
    const values = line.split(",");
    return keys.reduce((obj, key, idx) => ({ ...obj, [key]: values[idx] }), {});
  });
}

// Convert an array of objects to CSV string
function stringifyCSV(data) {
  const keys = Object.keys(data[0]);
  const lines = data.map((obj) => keys.map((k) => obj[k]).join(","));
  return [keys.join(","), ...lines].join("\n");
}

// Read a CSV file and return its records as objects
const readCSV = (file) =>
  new Promise((resolve, reject) => {
    if (!fs.existsSync(file)) return resolve([]);
    fs.readFile(file, "utf8", (err, data) => {
      if (err) return reject(err);
      resolve(parseCSV(data));
    });
  });

// Append a record to a CSV file, creating the file if it doesn't exist
const appendCSV = (file, record) =>
  new Promise(async (resolve, reject) => {
    const exists = fs.existsSync(file);
    const line = Object.values(record).join(",");
    if (!exists) {
      const header = Object.keys(record).join(",") + "\n";
      fs.writeFile(file, header + line + "\n", (err) =>
        err ? reject(err) : resolve()
      );
    } else {
      fs.appendFile(file, line + "\n", (err) =>
        err ? reject(err) : resolve()
      );
    }
  });

// Find a record by key (e.g., email)
async function findRecord(file, key, value) {
  const records = await readCSV(file);
  return records.find((r) => r[key] === value);
}

// Update a record by key (e.g., email)
async function updateRecord(file, key, value, updateObj) {
  const records = await readCSV(file);
  const idx = records.findIndex((r) => r[key] === value);
  if (idx === -1) return false;
  records[idx] = { ...records[idx], ...updateObj };
  await overwriteCSV(file, records);
  return true;
}

// Overwrite the entire CSV file with new records
async function overwriteCSV(file, records) {
  if (!records.length) return;
  const csv = stringifyCSV(records);
  return fs.promises.writeFile(file, csv + "\n");
}

// Generate a unique user ID
function generateUserId() {
  return randomUUID();
}

module.exports = {
  readCSV, // Read CSV file
  appendCSV, // Append record to CSV
  findRecord, // Find record by key
  updateRecord, // Update record by key
  overwriteCSV, // Overwrite CSV file
  generateUserId, // Generate unique user ID
};
