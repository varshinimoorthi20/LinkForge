const Url = require("../models/Url");
const Visit = require("../models/Visit");
const generateShortCode = require("../utils/generateShortCode");

// Create Short URL
exports.createShortUrl = async (req, res) => {
  try {
    const {
      originalUrl,
      customCode,
      expiryDays,
    } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        message: "Original URL is required",
      });
    }

    const cleanUrl = originalUrl.trim();

    let shortCode;

    if (customCode && customCode.trim() !== "") {

      const existingUrl = await Url.findOne({
        shortCode: customCode,
      });

      if (existingUrl) {
        return res.status(400).json({
          success: false,
          message: "Custom code already exists",
        });
      }

      shortCode = customCode.trim();

    } else {

      shortCode = generateShortCode();

    }

    let expiresAt = null;

    if (
      expiryDays &&
      expiryDays !== "never"
    ) {
      expiresAt = new Date();

      expiresAt.setDate(
        expiresAt.getDate() +
          Number(expiryDays)
      );
    }

    const classifyUrl = require("../utils/urlClassifier");
    const category = classifyUrl(cleanUrl);

    const url = await Url.create({
      userId: req.user._id,
      originalUrl: cleanUrl,
      shortCode,
      expiresAt,
      category,
    });

    res.status(201).json({
      success: true,
      message:
        "Short URL created successfully",
      shortCode,
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
      data: url,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Get All URLs
exports.getUserUrls = async (req, res) => {
  try {

    const urls = await Url.find({
      userId: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: urls.length,
      data: urls,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Delete URL
exports.deleteUrl = async (req, res) => {
  try {

    const url = await Url.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    await url.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "URL deleted successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Redirect URL
exports.redirectUrl = async (req, res) => {
  try {

    const { shortCode } = req.params;

    const url = await Url.findOne({
      shortCode,
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    // Expiry Check
    if (
      url.expiresAt &&
      new Date() > url.expiresAt
    ) {
      return res.status(410).send(`
        <h1>🔒 Link Expired</h1>
        <p>This shortened URL is no longer available.</p>
      `);
    }

    url.clickCount += 1;

    await url.save();

    const userAgent = req.headers["user-agent"] || "";

let browser = "Unknown";

if (userAgent.includes("Edg")) {
  browser = "Edge";
} else if (userAgent.includes("Firefox")) {
  browser = "Firefox";
} else if (userAgent.includes("Chrome")) {
  browser = "Chrome";
} else if (userAgent.includes("Safari")) {
  browser = "Safari";
}

let device = "Desktop";

if (/iPad/i.test(userAgent) || (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent))) {
  device = "Tablet";
} else if (/Android|iPhone|iPod/i.test(userAgent)) {
  device = "Mobile";
}

const mockCountries = ["United States", "India", "United Kingdom", "Germany", "Canada", "France", "Australia", "Singapore"];
const country = mockCountries[Math.floor(Math.random() * mockCountries.length)];

const isQr = req.query.source === "qr" || req.query.qr === "true";

await Visit.create({
  urlId: url._id,
  browser,
  device,
  country,
  isQr,
});
    return res.redirect(
      url.originalUrl
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Analytics
exports.getAnalytics = async (req, res) => {
  try {

    const url = await Url.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    const visits = await Visit.find({
      urlId: url._id,
    })
      .sort({
        visitedAt: -1,
      })
      .limit(10);

    res.status(200).json({
      success: true,
      totalClicks: url.clickCount,
      lastVisited:
        visits.length > 0
          ? visits[0].visitedAt
          : null,
      recentVisits: visits,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Check Link Health
const axios = require("axios");
exports.checkLinkHealth = async (req, res) => {
  try {
    const url = await Url.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    const start = Date.now();
    let status = "Healthy";
    let timeoutId;

    try {
      let testUrl = url.originalUrl;
      if (!/^https?:\/\//i.test(testUrl)) {
        testUrl = "http://" + testUrl;
      }

      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("Timeout")), 3000);
      });

      const axiosPromise = axios.get(testUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      await Promise.race([axiosPromise, timeoutPromise]);

      const duration = Date.now() - start;
      if (duration > 1500) {
        status = "Slow";
      }
    } catch (err) {
      status = "Down";
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }

    url.healthStatus = status;
    await url.save();

    res.status(200).json({
      success: true,
      status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Edit Destination URL
const validator = require("validator");
exports.updateUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        message: "Original URL is required",
      });
    }

    const cleanUrl = originalUrl.trim();
    if (!validator.isURL(cleanUrl)) {
      return res.status(400).json({
        success: false,
        message: "Invalid original URL format",
      });
    }

    const url = await Url.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    url.originalUrl = cleanUrl;
    const classifyUrl = require("../utils/urlClassifier");
    url.category = classifyUrl(cleanUrl);

    await url.save();

    res.status(200).json({
      success: true,
      message: "Destination URL updated successfully",
      data: url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Bulk URL Shortening via CSV Configuration & Controller
const multer = require("multer");
const csvParser = require("csv-parser");
const { Readable } = require("stream");

const storage = multer.memoryStorage();
exports.upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"), false);
    }
  }
});

exports.bulkUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a CSV file",
      });
    }

    const results = [];
    const stream = Readable.from(req.file.buffer.toString());

    await new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on("data", (data) => {
          results.push(data);
        })
        .on("end", resolve)
        .on("error", reject);
    });

    let createdCount = 0;
    let failedCount = 0;
    const createdUrls = [];

    const classifyUrl = require("../utils/urlClassifier");

    for (const row of results) {
      const urlStr = row.originalUrl || row.OriginalUrl || row.url || row.URL || Object.values(row)[0];

      if (!urlStr || !validator.isURL(urlStr.trim())) {
        failedCount++;
        continue;
      }

      const cleanUrl = urlStr.trim();
      const shortCode = generateShortCode();
      const category = classifyUrl(cleanUrl);

      try {
        const url = await Url.create({
          userId: req.user._id,
          originalUrl: cleanUrl,
          shortCode,
          category,
        });
        createdUrls.push(url);
        createdCount++;
      } catch (err) {
        failedCount++;
      }
    }

    res.status(200).json({
      success: true,
      totalRows: results.length,
      created: createdCount,
      failed: failedCount,
      data: createdUrls,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};