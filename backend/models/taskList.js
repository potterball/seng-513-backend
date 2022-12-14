const mongoose = require('mongoose');

const taskListSchema = new mongoose.Schema({
    // Board task list is associated with.
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true
    },
    // Title of the task list.
    title: {
        type: String,
        default: 'Untitled'
    }
    // Position of task list in master list of task lists.
    // Uncomment if supporting drag and drop for task lists.
    // position: {
    //     type: Number
    // },
});

module.exports = mongoose.model('TaskList', taskListSchema);