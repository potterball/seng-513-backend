const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema(
    {
        // Owner of the board.
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
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
    }
);

module.exports = mongoose.model('Board', boardSchema);