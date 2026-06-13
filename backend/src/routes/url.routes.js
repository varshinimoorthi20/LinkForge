const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");


const {
  createShortUrl,
  getUserUrls,
  deleteUrl,
  getAnalytics,
  checkLinkHealth,
  updateUrl,
  upload,
  bulkUpload,
} = require("../controllers/url.controller");

router.post("/", protect, createShortUrl);
router.post("/bulk", protect, upload.single("file"), bulkUpload);

router.get("/", protect, getUserUrls);
router.put("/:id", protect, updateUrl);
router.delete("/:id", protect, deleteUrl);
router.get("/:id/analytics", protect, getAnalytics);
router.get("/:id/health", protect, checkLinkHealth);


module.exports = router;