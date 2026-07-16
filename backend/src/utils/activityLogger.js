const Activity = require('../models/Activity');

/**
 * Helper utility to log user actions for timeline tracking.
 * Supports two calling conventions:
 *   1. logActivity({ boardId, userId, action, targetType, targetId, description })
 *   2. logActivity(userId, boardId, action, description)
 */
const logActivity = async (arg1, boardId, action, description) => {
  try {
    let params;

    if (typeof arg1 === 'object' && arg1 !== null && !Buffer.isBuffer(arg1)) {
      params = arg1; // object-style call
    } else {
      // positional call: (userId, boardId, action, description)
      params = {
        userId: arg1,
        boardId,
        action,
        description,
        targetType: 'BOARD',
        targetId: boardId,
      };
    }

    await Activity.create({
      boardId: params.boardId,
      userId: params.userId,
      action: params.action,
      targetType: params.targetType || 'BOARD',
      targetId: params.targetId || params.boardId,
      description: params.description,
    });
  } catch (error) {
    console.error('⚠️ Failed to log action in Activity collection:', error.message);
  }
};

module.exports = logActivity;
module.exports.logActivity = logActivity;

