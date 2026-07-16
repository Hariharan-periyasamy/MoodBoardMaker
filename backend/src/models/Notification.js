const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
    },
    type: {
      type: String,
      required: true,
      enum: [
        'BOARD_SHARED',
        'BOARD_UPDATED',
        'TILE_ADDED',
        'TILE_DELETED',
        'INVITATION_RECEIVED',
        'INVITATION_ACCEPTED',
        'SYSTEM'
      ],
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
