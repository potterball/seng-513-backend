const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    // Task list this task belongs to.
    taskList: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaskList',
        required: true
    },
    // Creator of the task.
    creator: {
        type: mongoose.Schema.Types.ObjectId,
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
        default: ''
    },
    // Position in task list.
    position: {
        type: Number
    }
});

module.exports = mongoose.model('Task', taskSchema);