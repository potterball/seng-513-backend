const Board = require('../models/board');
const TaskList = require('../models/taskList');
const Task = require('../models/task');
const User = require("../models/userModel");

// @desc Create a new task.
// @route POST /api/tasks/taskListId
// @access Public
const createTask = asyncHandler(async (req, res) => {
    const { taskListId } = req.params
    try {
        const taskList = await TaskList.findById(taskListId);
        if (!taskList) {
            res.status(404).json('task list not found');
        }
        else if (req.user.boards.includes(taskList.board)) {
            // User has permission to access board.
            // Create new task .
            const task = await Task.create({ taskList: taskList._id });
            // Return HTTP 201 Created.
            res.status(201).json(task);
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

// @desc Get all tasks for given taskList.
// @route GET /api/tasks/collections/taskListId
// @access Public
const getTasks = asyncHandler(async (req, res) => {
    const { taskListId } = req.params;
    try {
        const taskList = await TaskList
            .findById(taskListId)
            .sort({ position: 1 });
        if (!taskList) {
            res.status(404).json('task list not found');
        }
        else if (req.user.boards.includes(taskList.board)) {
            // User has permission to access board.
            // Find all task lists belonging to the given board.
            const tasks = await TaskList.find({ taskList: taskListId });
            // Return HTTP 200 Ok.
            res.status(200).json(tasks);
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

// @desc Get specified task for user.
// @route GET /api/tasks/taskId
// @access Public
const getTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    try {
        const task = await TaskList.findById(taskId);
        if (!task) {
            res.status(404).json('task not found');
        }
        else {
            const taskList = await TaskList.findById(task.taskList);
            if (req.user.boards.includes(taskList.board)) {
                // User can access this board and get this task.
                // Return HTTP 200 Ok and task list.
                res.status(200).json(task);
            } else {
                // Requesting user does not own or collaborate on board!
                // Return HTTP 403 Forbidden.
                res.status(403).json('invalid permissions');
            }
        }
    }
    catch (err) {
        // Error occurred. Return HTTP 500 Internal Server Error.
        res.status(500).json(err)
    }
});

// @desc Delete given task.
// @route DELETE /api/tasks/taskId
// @access Public
const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            res.status(404).json('task not found');
        } else {
            const taskList = await TaskList.findById(task.taskList);
            if (req.user.boards.includes(taskList.board)) {
                // User can access this board and delete task.
                // Delete task from list.
                await Task.deleteOne({ _id: taskId });
                // Return HTTP 200 Ok.
                res.status(200).json('task deleted');
            } else {
                // Requesting user does not own board!
                // Return HTTP 403 Forbidden.
                res.status(403).json('invalid permissions');
            }
        }
    } catch (err) {
        // Error occurred. Return HTTP 500 Internal Server Error.
        res.status(500).json(err);
    }
});

// @desc Update given task list in board.
// @route UPDATE /api/task/taskId
// @access Public
const updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params
    const { taskList, creator, title, description, position } = req.body
    try {
        // Check if user can modify task.
        const task = await TaskList.findById(taskId);
        if (!task) {
            // Task does not exist! Return HTTP 404 Not Found.
            return res.status(404).json('task not found');
        } else {
            const currentTaskList = await TaskList.findById(task.taskList);
            if (req.user.boards.includes(currentTaskList.board)) {
                // User has access to associated board and can update task.
                // Validated task list id.
                if (!taskList) {
                    req.body.task
                }
                else if (taskList != task.taskList){
                    const newTaskList = await TaskList.findById(taskList);
                    if (!newTaskList) {
                        // I could return HTTP Bad Request or
                        // default to the original task list.
                        req.body.taskList = task.taskList;
                    }
                }
                // Validate task list creator.
                if (!creator || creator != task.creator) {
                    // I could throw an HTTP bad reqiest, change this to a 'patch'
                    // complete with a DTO, or just default to the correct value.
                    // I am defaulting.
                    req.body.creator = task.creator;
                }
                // Validate task list title.
                if (!title || title === '') {
                    req.body.title = 'Untitled';
                }
                // Validate task list description.
                if (!description || description === '') {
                    req.body.description = 'Add task description...';
                }
                // Validate new position.
                const allTasks = await Task.find({ taskList: task.taskList });
                if (allTasks) {
                    const taskCount = allTasks.Count();
                    // Validate position.
                    if (!position || position < 1 || position >= taskCount ) {
                        // I could throw a HTTP Bad request or something, but I am just gonna default
                        // to the original position in the list.
                        req.body.position = task.position;
                    } else {
                        // Update position in list for other things.
                        // Not sure if this works at all tbh.
                        const tasksToUpdate = await Task.find({ taskLIst: task.taskList })
                            .where('position')
                            .gt(position)
                            .sort({ position: 1 });
                        let newPos = position + 1;
                        for (const t in tasksToUpdate) {
                            t.position = newPos;
                            await Task.findByIdAndUpdate(t._id, t);
                            newPos += 1;
                        }
                    }
                }
                // Update task to be the request body.
                const updatedTask = await Task.findByIdAndUpdate(taskId, { $set: req.body });
                // Return HTTP 200 Ok
                res.status(200).json(updatedTask);
            } else {
                // Requesting user does not own or collaborate on board!
                // Return HTTP 403 Forbidden.
                res.status(403).json('invalid permissions');
            }
        }
    } catch (err) {
        // Error occurred. Return HTTP 500 Internal Server Error.
        res.status(500).json(err);
    }
});

module.exports = {
    createTask,
    getTasks,
    getTask,
    deleteTask,
    updateTask,
};
