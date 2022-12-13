const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc Register a new user
// @route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, securityQ, securityA } = req.body;

  if (!name || !email || !password || !securityQ || !securityA) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Verifying email
  const emailVerification = await fetch(
    `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_API_KEY}&email=${email}`
  );
  if (!emailVerification.ok) {
    res.status(400);
    throw new Error("Email ID cannot be verified");
  }
  const dataEmail = await emailVerification.json();

  if (!dataEmail.deliverability || dataEmail.deliverability !== "DELIVERABLE") {
    res.status(400);
    throw new Error("Email ID cannot be verified");
  }

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    securityQ,
    securityA,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc Authenticate a user
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});

// @desc Get user data
// @route GET /api/users/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  const { _id, name, email } = await User.findById(req.user.id);

  res.status(200).json({
    id: _id,
    name,
    email,
  });
});

// @desc Change user password
// @route POST /api/users/me
// @access private
const changePassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error("Please add new password");
  }

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.findByIdAndUpdate(req.user.id, {
    password: hashedPassword,
  });

  res.status(201).json({
    _id: user.id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
});

const getSecurityQuestion = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (!userExists) {
    res.status(400);
    throw new Error("User does not exist");
  }

  res.status(200).json({
    email,
    securityQ: userExists.securityQ,
  });
});

const checkSecurityAnswer = asyncHandler(async (req, res) => {
  const { email, answer } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (!userExists) {
    res.status(400);
    throw new Error("User does not exist");
  }

  if (answer.normalize() !== userExists.securityA.normalize()) {
    res.status(400);
    throw new Error("Incorrect answer");
  }

  res.status(200).json({
    _id: userExists.id,
    name: userExists.name,
    email: userExists.email,
    token: generateToken(userExists._id),
  });
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  changePassword,
  getSecurityQuestion,
  checkSecurityAnswer,
};
