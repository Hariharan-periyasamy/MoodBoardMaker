const Board = require('../models/Board');
const Tile = require('../models/Tile');
const Activity = require('../models/Activity');
const { sendSuccess, sendError } = require('../utils/responseUtils');
const logActivity = require('../utils/activityLogger');

// @desc    Get all boards for current user
// @route   GET /api/boards
// @access  Private
const getBoards = async (req, res, next) => {
  try {
    const { archived = 'false', sort = '-createdAt' } = req.query;
    const isArchived = archived === 'true';

    const boards = await Board.find({
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ],
      isArchived
    })
      .sort(sort)
      .lean();

    return sendSuccess(res, boards, 'Boards fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new board
// @route   POST /api/boards
// @access  Private
const createBoard = async (req, res, next) => {
  try {
    const { title, description, themeColor, visibility } = req.body;

    if (!title || !title.trim()) {
      return sendError(res, 'Board title is required', 400);
    }

    const board = await Board.create({
      owner: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      themeColor: themeColor || '#7C3AED',
      visibility: visibility || 'private',
    });

    // Logging activity
    await logActivity({
      boardId: board._id,
      userId: req.user._id,
      action: 'BOARD_CREATED',
      targetType: 'BOARD',
      targetId: board._id,
      description: `Board "${board.title}" was created`,
    });

    return sendSuccess(res, board, 'Board created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single board by ID
// @route   GET /api/boards/:id
// @access  Private
const getBoardById = async (req, res, next) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    }).populate('collaborators.user', 'name email avatarColor');

    if (!board) {
      return sendError(res, 'Board not found', 404);
    }

    return sendSuccess(res, board, 'Board fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update board
// @route   PUT /api/boards/:id
// @access  Private
const updateBoard = async (req, res, next) => {
  try {
    const { title, description, themeColor, visibility } = req.body;

    const board = await Board.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { collaborators: { $elemMatch: { user: req.user._id, role: 'editor' } } }
      ]
    });

    if (!board) {
      return sendError(res, 'Board not found or access denied', 404);
    }

    if (title !== undefined) board.title = title.trim();
    if (description !== undefined) board.description = description.trim();
    if (themeColor !== undefined) board.themeColor = themeColor;
    if (visibility !== undefined) board.visibility = visibility;

    await board.save();

    // Logging activity
    await logActivity({
      boardId: board._id,
      userId: req.user._id,
      action: 'BOARD_UPDATED',
      targetType: 'BOARD',
      targetId: board._id,
      description: `Board "${board.title}" settings were updated`,
    });

    return sendSuccess(res, board, 'Board updated successfully');
  } catch (error) {
    next(error);
  }
};
// @desc    Delete board
// @route   DELETE /api/boards/:id
// @access  Private
const deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!board) {
      return sendError(res, 'Board not found', 404);
    }

    // Logging activity
    await logActivity({
      boardId: board._id,
      userId: req.user._id,
      action: 'BOARD_DELETED',
      targetType: 'BOARD',
      targetId: board._id,
      description: `Board "${board.title}" was deleted`,
    });

    return sendSuccess(res, null, 'Board deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle archive status
// @route   PUT /api/boards/:id/archive
// @access  Private
const toggleArchive = async (req, res, next) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!board) {
      return sendError(res, 'Board not found', 404);
    }

    board.isArchived = !board.isArchived;
    await board.save();

    const msg = board.isArchived ? 'Board archived' : 'Board unarchived';
    return sendSuccess(res, board, msg);
  } catch (error) {
    next(error);
  }
};

// @desc    Get board stats for current user
// @route   GET /api/boards/stats
// @access  Private
const getBoardStats = async (req, res, next) => {
  try {
    // 1. Fetch board counts
    const [total, active, archived, shared] = await Promise.all([
      Board.countDocuments({ owner: req.user._id }),
      Board.countDocuments({ owner: req.user._id, isArchived: false }),
      Board.countDocuments({ owner: req.user._id, isArchived: true }),
      Board.countDocuments({ owner: req.user._id, shareEnabled: true }),
    ]);

    // 2. Fetch all user boards to calculate aggregate Tile count
    const userBoards = await Board.find({ owner: req.user._id }).select('_id').lean();
    const boardIds = userBoards.map((b) => b._id);
    
    // 3. Count total Tiles
    const totalTiles = await Tile.countDocuments({ boardId: { $in: boardIds } });

    // 4. Count total User Activities logged
    const totalActivities = await Activity.countDocuments({ userId: req.user._id });

    // 5. Fetch recent boards edited
    const recentBoards = await Board.find({ owner: req.user._id, isArchived: false })
      .sort('-updatedAt')
      .limit(4)
      .lean();

    // 6. Fetch recently shared boards
    const recentShared = await Board.find({ owner: req.user._id, shareEnabled: true })
      .sort('-updatedAt')
      .limit(4)
      .lean();

    // 7. Fetch recent activity timeline items
    const recentActivities = await Activity.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(5)
      .populate('boardId', 'title themeColor')
      .lean();

    return sendSuccess(
      res,
      {
        total,
        active,
        archived,
        shared,
        tiles: totalTiles,
        activitiesCount: totalActivities,
        recentBoards,
        recentShared,
        recentActivities,
      },
      'Dashboard stats fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBoards,
  createBoard,
  getBoardById,
  updateBoard,
  deleteBoard,
  toggleArchive,
  getBoardStats,
};
