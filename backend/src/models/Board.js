const mongoose = require('mongoose');

const THEME_COLORS = [
  '#7C3AED', '#2563EB', '#059669', '#D97706',
  '#DC2626', '#DB2777', '#0891B2', '#65A30D',
];

const boardSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    themeColor: {
      type: String,
      default: '#7C3AED',
      validate: {
        validator: (v) => /^#[0-9A-Fa-f]{6}$/.test(v),
        message: 'Invalid color format',
      },
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    coverGradient: {
      type: String,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareToken: {
      type: String,
      default: null,
      sparse: true,
    },
    shareEnabled: {
      type: Boolean,
      default: false,
    },
    tileCount: {
      type: Number,
      default: 0,
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['editor', 'viewer'],
          default: 'editor',
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        }
      }
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for fast queries per owner
boardSchema.index({ owner: 1, createdAt: -1 });
boardSchema.index({ owner: 1, isArchived: 1 });

module.exports = mongoose.model('Board', boardSchema);
module.exports.THEME_COLORS = THEME_COLORS;
