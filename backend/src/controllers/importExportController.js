const Board = require('../models/Board');
const Tile = require('../models/Tile');
const { sendSuccess, sendError } = require('../utils/responseUtils');
const { logActivity } = require('../utils/activityLogger');

// @desc    Export board + tiles as JSON
// @route   GET /api/boards/:id/export
// @access  Private
const exportBoard = async (req, res, next) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, owner: req.user._id });
    if (!board) return sendError(res, 'Board not found or unauthorized', 404);

    const tiles = await Tile.find({ boardId: board._id }).sort({ sortOrder: 1 });

    const exportData = {
      version: '1.0.0',
      exportedAt: new Date(),
      board: {
        title: board.title,
        description: board.description,
        themeColor: board.themeColor,
        isPublic: board.isPublic,
        shareEnabled: board.shareEnabled,
      },
      tiles: tiles.map(t => ({
        imageUrl: t.imageUrl,
        caption: t.caption,
        tags: t.tags,
        themeColor: t.themeColor,
        positionX: t.positionX,
        positionY: t.positionY,
        sortOrder: t.sortOrder,
        colorPalette: t.colorPalette || [],
      })),
    };

    return res.status(200).json({
      success: true,
      message: 'Board exported successfully',
      data: exportData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import board + tiles from JSON
// @route   POST /api/boards/import
// @access  Private
const importBoard = async (req, res, next) => {
  try {
    const { board, tiles } = req.body;

    if (!board || !board.title) {
      return sendError(res, 'Invalid import data format: board title is required', 400);
    }

    // Create imported board
    const newBoard = await Board.create({
      title: `${board.title} (Imported)`,
      description: board.description || '',
      themeColor: board.themeColor || '#7C3AED',
      owner: req.user._id,
      isPublic: false, // Default to private
      shareEnabled: false,
    });

    // Create tiles
    if (Array.isArray(tiles) && tiles.length > 0) {
      const tileCreates = tiles.map(t => ({
        boardId: newBoard._id,
        imageUrl: t.imageUrl,
        caption: t.caption || '',
        tags: t.tags || [],
        themeColor: t.themeColor || '#7C3AED',
        positionX: t.positionX || 0,
        positionY: t.positionY || 0,
        sortOrder: t.sortOrder || 0,
        colorPalette: t.colorPalette || [],
      }));
      await Tile.insertMany(tileCreates);
    }

    await logActivity(req.user._id, newBoard._id, 'BOARD_CREATED', `Imported board: ${newBoard.title}`);

    return sendSuccess(res, newBoard, 'Board imported successfully', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportBoard,
  importBoard,
};
