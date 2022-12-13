const asyncHandler = require("express-async-handler");
const axios = require("axios");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const Board = require("../models/board");
const TaskList = require("../models/taskList");
const Task = require("../models/task");
const Invite = require("../models/invite");

// @desc Create a new board.
// @route POST /api/boards
// @access Public
const createBoard = asyncHandler(async (req, res) => {
  try {
    // Create new board instance.
    // const userId = mongoose.ObjectId(req.body.user._id);
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json("invalid permissions");
    } else {
      const board = await Board.create({
        owner: user._id,
        title: req.body?.boardName ?? "",
      });
      // Update master list of user boards.
      await User.updateOne(user, { $push: { boards: board } });
      // Return board object as json with 201 Created status.
      res.status(201).json(board);
    }
  } catch (err) {
    // Error occurred. Return HTTP 500 Internal Server Error.
    res.status(500).json(err);
  }
});

// @desc Get all boards for user.
// @route GET /api/boards
// @access Public
const getBoards = asyncHandler(async (req, res) => {
  try {
    // Find all boards whose id appears in the
    // user's master list of boards.
    // const user = await User.findById(req.user._id);
    const boards = await Board.find({
      _id: {
        $in: req.user.boards,
      },
    });
    // Return HTTP 200 Ok and all boards
    // belonging to user.
    res.status(200).json(boards);
  } catch (err) {
    // Error occurred. Return HTTP 500 Internal Server Error.
    res.status(500).json(err);
  }
});

// @desc Get specified board for user.
// @route GET /api/board/boardId
// @access Public
const getBoard = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  if (req.user.boards.includes(boardId)) {
    // User can access this board.
    try {
      // Find all desired board.
      const board = await Board.findById(boardId);
      // Return HTTP 200 Ok and desired board.
      res.status(200).json(board);
    } catch (err) {
      // Error occurred. Return HTTP 500 Internal Server Error.
      res.status(500).json(err);
    }
  } else {
    // Requesting user does not own or collaborate on board!
    // Return HTTP 403 Forbidden.
    res.status(403).json("invalid permissions");
  }
});

// @desc Delete given board if owned by user.
// @route DELETE /api/boards/boardId
// @access Public
const deleteBoard = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  // Check if board can be deleted by requesting user.
  const board = await Board.findById(boardId);
  if (board.owner == req.user.id) {
    // Board belongs to requesting user. Can delete!
    try {
      // Get all task lists beloinging to the board to be deleted.
      const lists = await TaskList.find({ board: boardId });
      // Delete all tasks from every task list in the board.
      for (const list of lists) {
        await Task.deleteMany({ taskList: list._id });
      }
      // Delete all task lists in the board.
      await TaskList.deleteMany({ board: boardId });
      // Delete board.
      await Board.deleteOne({ _id: boardId });
      // Return HTTP 200 Ok.
      res.status(200).json("board deleted");
    } catch (err) {
      // Error occurred. Return HTTP 500 Internal Server Error.
      res.status(500).json(err);
    }
  } else {
    // Requesting user does not own board!
    // Return HTTP 403 Forbidden.
    res.status(403).json("invalid permissions");
  }
});

// @desc Update given board.
// @route UPDATE /api/boards/boardId
// @access Public
const updateBoard = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  const { title } = req.body;
  if (req.user.boards.includes(boardId)) {
    // User can access this board.
    try {
      if (title === "") {
        req.body.title = "Untitled";
      }
      const board = await Board.findById(boardId);
      if (!board) {
        // Board does not exist!
        // Return HTTP 404 Not Found.
        return res.status(404).json("Board not found");
      }
      // Update board to be the request body.
      board.title = req.body.title;
      await Board.updateOne(board);
      res.status(200).json(board);
    } catch (err) {
      // Error occurred. Return HTTP 500 Internal Server Error.
      res.status(500).json(err);
    }
  } else {
    // Requesting user does not own or collaborate on board!
    // Cannot update board! Return HTTP 403 Forbidden.
    res.status(403).json("invalid permissions");
  }
});

const inviteUser = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  const { email } = req.body;

  if (req.user.boards.includes(boardId)) {
    // User can access this board.
    try {
      const user = await User.findOne({ email });
      const board = await Board.findById(boardId);
      if (!user) {
        // verify email
        let response;
        try {
          response = await axios.get(
            `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_API_KEY}&email=${email}`
          );
        } catch (error) {
          res.status(400);
          throw new Error("Email ID cannot be verified");
        }

        const dataEmail = response.data;

        if (
          !dataEmail.deliverability ||
          dataEmail.deliverability !== "DELIVERABLE"
        ) {
          throw new Error("Email ID cannot be verified");
        }

        // Add to invite model
        const inviteExists = await Invite.findOne({ email });

        if (inviteExists) {
          await Invite.updateOne(inviteExists, {
            $push: { invitedboards: board },
          });
        } else {
          const invite = await Invite.create({
            email,
          });
          await Invite.updateOne(invite, { $push: { invitedboards: board } });
        }
      } else {
        await User.updateOne(user, { $push: { boards: board } });
      }
      res.status(201).json({ message: "success" });
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    // Requesting user does not own or collaborate on board!
    // Cannot update board! Return HTTP 403 Forbidden.
    res.status(403);
    throw new Error("Invalid Permissions");
  }
});

module.exports = {
  createBoard,
  getBoards,
  getBoard,
  deleteBoard,
  updateBoard,
  inviteUser,
};
