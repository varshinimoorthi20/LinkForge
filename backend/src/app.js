const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const urlRoutes = require("./routes/url.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const { redirectUrl } = require("./controllers/url.controller");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "URL Shortener API Running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/urls", urlRoutes);
app.use("/api/analytics", analyticsRoutes);

// Redirect Route
app.get("/:shortCode", redirectUrl);

module.exports = app;