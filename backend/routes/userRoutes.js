const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  changePassword,
  getSecurityQuestion,
  checkSecurityAnswer,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/recovery", getSecurityQuestion);
router.post("/recovery", checkSecurityAnswer);
router.post("/reset", protect, changePassword);
router.post("/me", protect, changePassword);

module.exports = router;
