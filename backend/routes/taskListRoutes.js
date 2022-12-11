const express = require("express");
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

router.get(
    '/collections/:boardId',
    protect,
    getTaskLists
);

router.get(
    '/:taskListId',
    protect,
    getTaskList
);

router.put(
    '/:taskListId',
    protect,
    updateTaskList
);

router.delete(
    '/:taskListId',
    protect,
    deleteTaskList
);

module.exports = router;
