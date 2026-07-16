const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'BOARD_CREATED',
        'BOARD_UPDATED',
        'BOARD_DELETED',
        'TILE_ADDED',
        'TILE_UPDATED',
        'TILE_DELETED',
        'TILE_MOVED',
        'SHARE_ENABLED',
        'SHARE_DISABLED',
        'LINK_REGENERATED',
      ],
    },
    targetType: {
      type: String,
      required: true,
      enum: ['BOARD', 'TILE'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We use custom timestamp
  }
);

// Fast indexing for timeline query of a user
activitySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);
