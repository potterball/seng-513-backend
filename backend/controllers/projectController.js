const asyncHandler = require("express-async-handler");
// @desc Get projects of user
// @route GET /api/projects
// @acess Private
const getProjects = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "Get projects" });
});

// @desc Create project of user
// @route POST /api/projects
// @acess Private
const setProject = asyncHandler(async (req, res) => {
  if (!req.body.test) {
    res.status(400);
    throw new Error("Please add a text field");
  }
  res.status(200).json({ message: "Set project" });
});

// @desc Update project of user
// @route PUT /api/projects/:id
// @acess Private
const updateProject = asyncHandler(async (req, res) => {
  res.status(200).json({ message: `Update project ${req.params.id}` });
});

// @desc Delete a project of user
// @route Delete /api/projects/:id
// @acess Private
const deleteProject = asyncHandler(async (req, res) => {
  res.status(200).json({ message: `Delete project ${req.params.id}` });
});

module.exports = {
  getProjects,
  setProject,
  updateProject,
  deleteProject,
};
