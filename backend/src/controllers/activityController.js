const Activity = require('../models/Activity');
const { sendSuccess } = require('../utils/responseUtils');

// @desc    Get user activities with filters
// @route   GET /api/activity
// @access  Private
const getActivities = async (req, res, next) => {
  try {
    const { boardId, action, dateRange, search } = req.query;
    
    // Base filter: limit to current authenticated user
    const filterQuery = { userId: req.user._id };

    // Filter by boardId
    if (boardId) {
      filterQuery.boardId = boardId;
    }

    // Filter by action type
    if (action) {
      filterQuery.action = action;
    }

    // Filter by date range
    if (dateRange) {
      const now = new Date();
      if (dateRange === 'today') {
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        filterQuery.timestamp = { $gte: oneDayAgo };
      } else if (dateRange === '7days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filterQuery.timestamp = { $gte: sevenDaysAgo };
      } else if (dateRange === 'month') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filterQuery.timestamp = { $gte: thirtyDaysAgo };
      }
    }

    // Filter by description text search
    if (search && search.trim()) {
      filterQuery.description = { $regex: search.trim(), $options: 'i' };
    }

    const activities = await Activity.find(filterQuery)
      .populate('boardId', 'title themeColor visibility')
      .sort({ timestamp: -1 })
      .lean();

    return sendSuccess(res, activities, 'User activity history fetched successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities,
};
