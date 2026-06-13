const express = require("express");

const router = express.Router();

const {
  register,
  login,
} = require("../controllers/auth.controller");

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth Route Working",
  });
});
const protect = require("../middleware/auth.middleware");

router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

router.post("/register", register);

router.post("/login", login);

module.exports = router;