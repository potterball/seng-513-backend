const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();
const {
  createBoard,
  getBoards,
  getBoard,
  deleteBoard,
  updateBoard,
} = require("../controllers/boardController");
const { protect } = require("../middleware/authMiddleware");

router.post('/', protect, createBoard);
router.get('/', protect, getBoards);
// TODO Route for getBoard
// TODO Route for deleteBoard
// TODO Route for updateBoard

module.exports = router;
