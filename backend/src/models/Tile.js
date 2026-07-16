const mongoose = require('mongoose');

const tileSchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'Board ID is required'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL or File is required'],
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [200, 'Caption cannot exceed 200 characters'],
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    themeColor: {
      type: String,
      default: '#7C3AED',
      validate: {
        validator: (v) => /^#[0-9A-Fa-f]{6}$/.test(v),
        message: 'Invalid color format',
      },
    },
    positionX: {
      type: Number,
      default: 0,
    },
    positionY: {
      type: Number,
      default: 0,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    colorPalette: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.every(c => /^#[0-9A-Fa-f]{6}$/.test(c)),
        message: 'Each palette color must be a valid HEX code',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for rendering all tiles in a board ordered by layout positions / sortOrder
tileSchema.index({ boardId: 1, sortOrder: 1 });

module.exports = mongoose.model('Tile', tileSchema);
