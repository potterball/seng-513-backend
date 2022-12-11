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

/*
 * @desc Create a new board. Requires bearer token authorisation.
 * @route POST /api/boards
 * @access Public
 *
 */
router.post(
    '/',
    protect,
    createBoard
);

/*
 * @desc Get all boards linked to user. Requires bearer token authorisation.
 * @route GET /api/boards
 * @access Public
 *
 */
router.get(
    '/',
    protect,
    getBoards
);
/*
 * @desc Get boards by board id. Requires bearer token authorisation.
 * @route GET /api/boards/boardId
 * @access Public
 *
 */
router.get(
    '/:boardId',
    protect,
    getBoard
);
/*
 * @desc Update board by board id. Requires bearer token authorisation.
 * @route PUT /api/boards/boardId
 * @access Public
 *
 */
router.put(
    '/:boardId',
    protect,
    updateBoard
);
/*
 * @desc Delete board by board id. Requires bearer token authorisation.
 * @route DELETE /api/boards/boardId
 * @access Public
 *
 */
router.delete(
    '/:boardId',
    protect,
    deleteBoard
);

module.exports = router;
