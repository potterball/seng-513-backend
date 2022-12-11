const asyncHandler = require("express-async-handler");
const TaskList = require('../models/taskList');
const Task = require('../models/task');

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
            // User has permission to access board. Create new task in list.
            const taskCount = (await Task.find({ taskList: taskListId })).length;
            const task = await Task.create(
                {
                    taskList: taskListId,
                    creator: req.user._id,
                    position: taskCount,
                }
            );
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
        const taskList = await TaskList.findById(taskListId);
        if (!taskList) {
            res.status(404).json('task list not found');
        }
        else if (req.user.boards.includes(taskList.board)) {
            // User has permission to access board.
            // Find all task lists belonging to the given task list.
            const tasks = await Task
                .find({ taskList: taskListId })
                .sort({ position: 1 });
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
        const task = await Task.findById(taskId);
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
                // Update position in list for other tasks.
                const tasksToUpdate = await Task.find({ taskList: task.taskList })
                        .where('position')
                        .gt(task.position)
                        .sort({ position: 1 });
                const shift = -1;
                for (let i = 0; i < tasksToUpdate.length; i++) {
                    const t = tasksToUpdate[i];
                    const newPos = t.position + shift;
                    await Task.findByIdAndUpdate(t._id, { position: newPos });
                }
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
    const { taskList, title, description, position } = req.body
    try {
        const task = await Task.findById(taskId);
        let newTaskListId = task.taskList,
            newTitle, newDescription, newPosition;
        // Check if user can modify task.
        if (!task) {
            // Task does not exist! Return HTTP 404 Not Found.
            return res.status(404).json('task not found');
        } else {
            const currentTaskList = await TaskList.findById(task.taskList);
            if (req.user.boards.includes(currentTaskList.board)) {
                // User has access to associated board and can update task.
                // Validated task list id.
                if (taskList && taskList != task.taskList){
                    const newTaskList = await TaskList.findById(taskList);
                    if (newTaskList) {
                        newTaskListId = taskList;
                    }
                    // I am just gonna default to the original task list if
                    // the proposed new one does not exist.
                }
                // Validate task list title.
                if (!title) {
                    newTitle = task.title;
                } else if (title === '') {
                    newTitle = 'Untitled';
                } else {
                    newTitle = title;
                }
                // Validate task list description.
                if (!description) {
                    newDescription = task.description;
                } else if (description === '') {
                    newDescription = 'Add task description...';
                } else {
                    newDescription = description;
                }
                // Validate new position.
                const taskCount = (await Task.find({ taskList: task.taskList })).length;
                // Validate position.
                if (position === undefined || (position < 0 || position >= taskCount)) {
                    // I could throw a HTTP Bad request or something, but I am just gonna default
                    // to the original position in the list.
                    newPosition = task.position;
                } else {
                    // Update position in list for other tasks. Not sure if this works at all tbh.
                    let tasksToUpdate, shift;
                    if (position > task.position) {
                        tasksToUpdate = await Task.find({ taskList: task.taskList })
                            .where('position')
                            .gt(task.position)
                            .lte(position)
                            .sort({ position: 1 });
                        shift = -1;
                    } else if (position < task.position) {
                        tasksToUpdate = await Task.find({ taskList: task.taskList })
                            .where('position')
                            .gte(position)
                            .lt(task.position)
                            .sort({ position: 1 });
                        shift = 1;
                    }
                    for (let i = 0; i < tasksToUpdate.length; i++) {
                        const t = tasksToUpdate[i];
                        const newPos = t.position + shift;
                        await Task.findByIdAndUpdate(t._id, { position: newPos });
                    }
                    newPosition = position;
                }
                // Update task to be the request body.
                await Task.findByIdAndUpdate(
                    taskId,
                    {
                        taskList: newTaskListId,
                        creator: task.creator,
                        title: newTitle,
                        description: newDescription,
                        position: newPosition,
                    }
                );
                // Return HTTP 200 Ok
                res.status(200).json(await Task.findById(taskId));
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
