const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    // Task modification was performed on.
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    // Person who performed edit on task.
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaskList',
        required: true
    },
    // Short description of modification.
    title: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('HistoryEntry', historySchema);