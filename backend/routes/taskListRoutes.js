const express = require("express");
const mongoose = require('mongoose')
const router = express.Router();
const {
    createTaskList,
    getTaskLists,
    getTaskList,
    deleteTaskList,
    updateTaskList,
} = require("../controllers/taskListController");
const { protect } = require("../middleware/authMiddleware");

router.post(
    '/:boardId',
    protect,
    createTaskList
);

module.exports = router;
