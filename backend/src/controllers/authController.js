const User = require('../models/User');
const { generateToken } = require('../utils/tokenUtils');
const { sendSuccess, sendError } = require('../utils/responseUtils');
const bcrypt = require('bcryptjs');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Please provide name, email, and password', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'An account with this email already exists', 409);
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password,
    });

    const token = generateToken(user._id);

    return sendSuccess(
      res,
      { user: user.toJSON(), token },
      'Account created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide email and password', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user._id);

    return sendSuccess(
      res,
      { user: user.toJSON(), token },
      'Logged in successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, user.toJSON(), 'User fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatarColor } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (name !== undefined) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatarColor !== undefined) user.avatarColor = avatarColor;

    await user.save();
    return sendSuccess(res, user.toJSON(), 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 'Please provide current and new password', 400);
    }

    if (newPassword.length < 6) {
      return sendError(res, 'New password must be at least 6 characters', 400);
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect', 401);
    }

    user.passwordHash = newPassword;
    await user.save();

    return sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete account
// @route   DELETE /api/auth/account
// @access  Private
const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 'Password is incorrect', 401);
    }

    await User.findByIdAndDelete(req.user._id);
    // Also delete all boards owned by user
    const Board = require('../models/Board');
    await Board.deleteMany({ owner: req.user._id });

    return sendSuccess(res, null, 'Account deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword, deleteAccount };
