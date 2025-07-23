// Utility functions for sanitizing input strings and objects
function sanitize(str) {
  return String(str || "")
    .replace(/[^a-zA-Z0-9@.\-_\'\s]/g, "")
    .trim();
}

function sanitizeFields(obj, fields) {
  const sanitized = { ...obj };
  fields.forEach((key) => {
    sanitized[key] = sanitize(obj[key]);
  });
  return sanitized;
}

module.exports = {
  sanitize,
  sanitizeFields,
};
