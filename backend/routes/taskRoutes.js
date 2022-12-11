const express = require("express");
const router = express.Router();
const {
    createTask,
    getTasks,
    getTask,
    deleteTask,
    updateTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

router.post(
    '/:taskListId',
    protect,
    createTask
);

router.get(
    '/collections/:taskListId',
    protect,
    getTasks
);

router.get(
    '/:taskId',
    protect,
    getTask
);

router.put(
    '/:taskId',
    protect,
    updateTask
);

router.delete(
    '/:taskId',
    protect,
    deleteTask
);

module.exports = router;
