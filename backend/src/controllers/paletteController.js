const Tile = require('../models/Tile');
const Board = require('../models/Board');
const { sendSuccess, sendError } = require('../utils/responseUtils');
const { extractColorPalette } = require('../utils/paletteHelper');

// @desc    Extract color palette from a tile's image
// @route   POST /api/tiles/:id/palette
// @access  Private
const extractPalette = async (req, res, next) => {
  try {
    const tile = await Tile.findById(req.params.id);
    if (!tile) return sendError(res, 'Tile not found', 404);

    // Verify board ownership/write access
    const board = await Board.findOne({
      _id: tile.boardId,
      $or: [
        { owner: req.user._id },
        { collaborators: { $elemMatch: { user: req.user._id, role: 'editor' } } }
      ]
    });
    if (!board) return sendError(res, 'Access denied', 403);

    const colors = await extractColorPalette(tile.imageUrl);

    if (colors.length === 0) {
      return sendError(res, 'Could not extract colors from this image', 422);
    }

    // Save palette to tile
    tile.colorPalette = colors;
    await tile.save();

    return sendSuccess(res, { colorPalette: colors }, 'Color palette extracted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { extractPalette };
