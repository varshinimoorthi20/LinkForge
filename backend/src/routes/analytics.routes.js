const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");

const {
  getAnalyticsOverview,
  getLinkAnalyticsDetails
} = require("../controllers/analytics.controller");

router.get("/overview", protect, getAnalyticsOverview);
router.get("/:id/details", protect, getLinkAnalyticsDetails);

module.exports = router;
