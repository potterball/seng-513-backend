const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    // Task list this task belongs to.
    taskList: {
        type: Schema.Types.ObjectId,
        ref: 'TaskList',
        required: true
    },
    // Creator of the task.
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Title of task.
    title: {
        type: String,
        default: 'Untitled'
    },
    // Description of task.
    description: {
        type: String,
        default: 'Untitled'
    },
    // Position in task list.
    position: {
        type: Number
    }
});

modules.export = mongoose.Model('Task', taskSchema);