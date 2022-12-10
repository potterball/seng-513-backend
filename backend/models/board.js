const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
    // Owner of the board.
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // List of board collaborators.
    collaborators: [{ type : ObjectId, ref: 'User' }],
    // Title of board.
    title: {
        type: String,
        default: 'Untitled'
    },
    // Position of board in master list of boards.
    // Uncomment if supporting drag and drop for boards.
    // position: {
    //     type: Number
    // },
});

modules.export = mongoose.Model('Board', boardSchema);