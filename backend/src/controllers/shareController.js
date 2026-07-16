const crypto = require('crypto');
const Board = require('../models/Board');
const Tile = require('../models/Tile');
const { sendSuccess, sendError } = require('../utils/responseUtils');
const logActivity = require('../utils/activityLogger');

// @desc    Enable sharing and generate token
// @route   POST /api/share/:boardId
// @access  Private
const enableSharing = async (req, res, next) => {
  try {
    const board = await Board.findOne({ _id: req.params.boardId, owner: req.user._id });
    if (!board) {
      return sendError(res, 'Board not found or access denied', 404);
    }

    if (!board.shareToken) {
      board.shareToken = crypto.randomBytes(16).toString('hex');
    }
    board.shareEnabled = true;
    board.isPublic = true;
    board.visibility = 'public'; // Sync old visibility state

    await board.save();

    await logActivity({
      boardId: board._id,
      userId: req.user._id,
      action: 'SHARE_ENABLED',
      targetType: 'BOARD',
      targetId: board._id,
      description: `Enabled public board sharing links`,
    });

    return sendSuccess(res, board, 'Public sharing enabled successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Disable sharing link
// @route   DELETE /api/share/:boardId
// @access  Private
const disableSharing = async (req, res, next) => {
  try {
    const board = await Board.findOne({ _id: req.params.boardId, owner: req.user._id });
    if (!board) {
      return sendError(res, 'Board not found or access denied', 404);
    }

    board.shareEnabled = false;
    board.isPublic = false;
    board.visibility = 'private'; // Sync old visibility state

    await board.save();

    await logActivity({
      boardId: board._id,
      userId: req.user._id,
      action: 'SHARE_DISABLED',
      targetType: 'BOARD',
      targetId: board._id,
      description: `Disabled public board sharing links`,
    });

    return sendSuccess(res, board, 'Public sharing link disabled successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Regenerate share token
// @route   POST /api/share/regenerate/:boardId
// @access  Private
const regenerateToken = async (req, res, next) => {
  try {
    const board = await Board.findOne({ _id: req.params.boardId, owner: req.user._id });
    if (!board) {
      return sendError(res, 'Board not found or access denied', 404);
    }

    board.shareToken = crypto.randomBytes(16).toString('hex');
    board.shareEnabled = true;
    board.isPublic = true;
    board.visibility = 'public';

    await board.save();

    await logActivity({
      boardId: board._id,
      userId: req.user._id,
      action: 'LINK_REGENERATED',
      targetType: 'BOARD',
      targetId: board._id,
      description: `Regenerated board share access token`,
    });

    return sendSuccess(res, board, 'Share token regenerated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    View shared board anonymously (view-only)
// @route   GET /api/share/:token
// @access  Public (No Auth required)
const getSharedBoard = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    // Find board
    const board = await Board.findOne({ shareToken: token, shareEnabled: true })
      .populate('owner', 'name email avatarColor')
      .lean();

    if (!board) {
      return sendError(res, 'Shared board not found or link has expired', 404);
    }

    // Find tiles inside
    const tiles = await Tile.find({ boardId: board._id }).sort({ sortOrder: 1, createdAt: 1 }).lean();

    return sendSuccess(res, { board, tiles }, 'Shared board details fetched');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enableSharing,
  disableSharing,
  regenerateToken,
  getSharedBoard,
};
