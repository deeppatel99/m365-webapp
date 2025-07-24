// Route handler for dashboard endpoints
const express = require("express");
const router = express.Router();
const dashboardService = require("../services/dashboardService");

// POST /api/dashboard/execute-query
router.post("/execute-query", async (req, res) => {
  try {
    const result = await dashboardService.executeQuery(req.body);
    res.json(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      error: error.message || "Internal server error",
    });
  }
});

module.exports = router;