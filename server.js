// Import required modules
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboardRoute");
const config = require("./config");
require("dotenv").config(); // Load environment variables from .env

const app = express();
const PORT = config.PORT || 3005;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Serve React frontend from /build in production
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "build");
  app.use(express.static(buildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

// Global error handler
const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
