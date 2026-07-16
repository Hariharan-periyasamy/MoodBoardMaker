const Board = require('../models/Board');
const Tile = require('../models/Tile');
const { sendSuccess, sendError } = require('../utils/responseUtils');

// @desc    Perform a global text search across boards and tiles
// @route   GET /api/search
// @access  Private
const globalSearch = async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    
    if (!q || !q.trim()) {
      return sendSuccess(res, { boards: [], tiles: [] }, 'Empty search query processed');
    }

    const query = q.trim();
    const regex = { $regex: query, $options: 'i' };

    // 1. Search owned boards
    const boards = await Board.find({
      owner: req.user._id,
      $or: [{ title: regex }, { description: regex }],
    })
      .sort({ updatedAt: -1 })
      .lean();

    // 2. Fetch all user board IDs to scope tile searches
    const userBoards = await Board.find({ owner: req.user._id }).select('_id').lean();
    const boardIds = userBoards.map((b) => b._id);

    // 3. Search tiles inside user's boards
    const tilesFilter = {
      boardId: { $in: boardIds },
      $or: [{ caption: regex }, { tags: regex }, { imageUrl: regex }],
    };

    const tiles = await Tile.find(tilesFilter)
      .populate('boardId', 'title themeColor')
      .sort({ updatedAt: -1 })
      .lean();

    return sendSuccess(res, { boards, tiles }, 'Global search results retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  globalSearch,
};
