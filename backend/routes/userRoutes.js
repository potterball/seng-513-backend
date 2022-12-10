const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  changePassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
// router.post("/recovery");
router.post("/me", protect, changePassword);

module.exports = router;
