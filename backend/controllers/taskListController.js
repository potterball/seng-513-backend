const asyncHandler = require("express-async-handler");
const Board = require('../models/board');
const TaskList = require('../models/taskList');
const Task = require('../models/task');
const User = require("../models/userModel");

// @desc Create a new taskList.
// @route POST /api/taskLists/boardId
// @access Public
const createTaskList = asyncHandler(async (req, res) => {
    const { boardId } = req.params
    try {
        if (req.user.boards.includes(boardId)) {
            // User has permission to access board.
            // Create new taskList .
            const taskList = await TaskList.create({ owner: boardId });
            // Return HTTP 201 Created.
            res.status(201).json(taskList);
        } else {
            // Requesting user does not own or collaborate on board!
            // Return HTTP 403 Forbidden.
            res.status(403).json('invalid permissions');
        }
    } catch (err) {
        // Error occurred. Return HTTP 500 Internal Server Error.
        res.status(500).json(err);
    }
});

// @desc Get all taskLists for given board.
// @route GET /api/taskLists/collections/boardId
// @access Public
const getTaskLists = asyncHandler(async (req, res) => {
    const { boardId } = req.params;
    try {
        if (req.user.boards.includes(boardId)) {
            // User has permission to access board.
            // Find all task lists belonging to the given board.
            const taskLists = await TaskList.find({ board: boardId });
            // Return HTTP 200 Ok.
            res.status(200).json(taskLists);
        } else {
            // Requesting user does not own or collaborate on board!
            // Return HTTP 403 Forbidden.
            res.status(403).json('invalid permissions');
        }
    } catch (err) {
        // Error occurred. Return HTTP 500 Internal Server Error.
        res.status(500).json(err)
    }
});

// @desc Get specified taskList for user.
// @route GET /api/taskLists/taskListId
// @access Public
const getTaskList = asyncHandler(async (req, res) => {
    const { taskListId } = req.params;
    try {
        const taskList = await TaskList.findById(taskListId);
        if (req.user.boards.includes(taskList.board)) {
            // User can access this board.
            // Return HTTP 200 Ok and task list.
            res.status(200).json(taskList);
        } else {
            // Requesting user does not own or collaborate on board!
            // Return HTTP 403 Forbidden.
            res.status(403).json('invalid permissions');
        }
    }
    catch (err) {
        // Error occurred. Return HTTP 500 Internal Server Error.
        res.status(500).json(err)
    }
});

// @desc Delete given taskList from board.
// @route DELETE /api/taskLists/taskListId
// @access Public
const deleteTaskList = asyncHandler(async (req, res) => {
    const { taskListId } = req.params
    try {
        const taskList = await TaskList.findById(taskListId);
        if (req.user.boards.includes(taskList.board)) {
            // User can access this board.
            // Delete all tasks from task list.
            await Task.deleteMany({ taskList: taskListId });
            // Delete task list.
            await TaskList.deleteOne({ _id: taskListId });
            // Return HTTP 200 Ok.
            res.status(200).json('task list deleted');
        } else {
            // Requesting user does not own board!
            // Return HTTP 403 Forbidden.
            res.status(403).json('invalid permissions');
        }
    } catch (err) {
        // Error occurred. Return HTTP 500 Internal Server Error.
        res.status(500).json(err);
    }
});

// @desc Update given task list in board.
// @route UPDATE /api/taskList/taskListId
// @access Public
const updateTaskList = asyncHandler(async (req, res) => {
    const { taskListId } = req.params
    const { title } = req.body
    try {
        // Check if user can modify board.
        const taskList = await TaskList.findById(taskListId);
        if (!taskList) {
            // TaskList does not exist!
            // Return HTTP 404 Not Found.
            return res.status(404).json('Board not found');
        } else if (req.user.boards.includes(taskList.board)) {
            // User has access to associated board.
            if (title === '') {
                req.body.title = 'Untitled';
            }
            // Update taskList to be the request body.
            const updatedTaskList = await Board.findByIdAndUpdate(taskListId, { $set: req.body });
            res.status(200).json(updatedTaskList);
        } else {
            // Requesting user does not own or collaborate on board!
            // Return HTTP 403 Forbidden.
            res.status(403).json('invalid permissions');
        }
    } catch (err) {
        // Error occurred. Return HTTP 500 Internal Server Error.
        res.status(500).json(err);
    }
});

module.exports = {
    createTaskList,
    getTaskLists,
    getTaskList,
    deleteTaskList,
    updateTaskList,
};
