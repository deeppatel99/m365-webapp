// Import required modules
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const config = require("./config");
require("dotenv").config(); // Load environment variables from .env

const app = express();
console.log(config.PORT);
const PORT = config.PORT || 3005; // Use port from config or default to 3005

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse incoming JSON requests

// Mount authentication routes under /api
app.use("/api", authRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
