const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    // Task modification was performed on.
    task: {
        type: Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    // Person who performed edit on task.
    user: {
        type: Schema.Types.ObjectId,
        ref: 'TaskList',
        required: true
    },
    // Short description of modification.
    title: {
        type: String,
        default: ''
    }
});

modules.export = mongoose.Model('HistoryEntry', historySchema);