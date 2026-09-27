const Tile = require('../models/Tile');
const Board = require('../models/Board');
const { sendSuccess, sendError } = require('../utils/responseUtils');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const logActivity = require('../utils/activityLogger');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { extractColorPalette } = require('../utils/paletteHelper');

// @desc    Get all tiles for a specific board
// @route   GET /api/tiles
// @access  Private
const getTiles = async (req, res, next) => {
  try {
    const { boardId } = req.query;
    if (!boardId) {
      return sendError(res, 'Board ID is query parameter required', 400);
    }

    // Verify board ownership or collaborator access
    const board = await Board.findOne({
      _id: boardId,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    });
    if (!board) {
      return sendError(res, 'Board not found or access denied', 403);
    }

    const tiles = await Tile.find({ boardId }).sort({ sortOrder: 1, createdAt: 1 }).lean();
    return sendSuccess(res, tiles, 'Tiles fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single tile
// @route   GET /api/tiles/:id
// @access  Private
const getTileById = async (req, res, next) => {
  try {
    const tile = await Tile.findById(req.params.id);
    if (!tile) {
      return sendError(res, 'Tile not found', 404);
    }

    // Verify board ownership or collaborator access
    const board = await Board.findOne({
      _id: tile.boardId,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    });
    if (!board) {
      return sendError(res, 'Access denied', 403);
    }

    return sendSuccess(res, tile, 'Tile fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create a tile
// @route   POST /api/tiles
// @access  Private
const createTile = async (req, res, next) => {
  try {
    const { boardId, imageUrl, caption, tags, themeColor } = req.body;

    if (!boardId) {
      return sendError(res, 'Board ID is required', 400);
    }
    if (!imageUrl) {
      return sendError(res, 'Image URL or upload is required', 400);
    }

    // Verify board ownership or write access
    const board = await Board.findOne({
      _id: boardId,
      $or: [
        { owner: req.user._id },
        { collaborators: { $elemMatch: { user: req.user._id, role: 'editor' } } }
      ]
    });
    if (!board) {
      return sendError(res, 'Board not found or access denied', 403);
    }

    // Find current max sortOrder
    const maxTile = await Tile.findOne({ boardId }).sort({ sortOrder: -1 }).select('sortOrder').lean();
    const nextSortOrder = maxTile ? (maxTile.sortOrder || 0) + 1 : 0;

    // Automatically extract color palette at creation time
    const colorPalette = await extractColorPalette(imageUrl);

    const tile = await Tile.create({
      boardId,
      imageUrl,
      caption: caption || '',
      tags: Array.isArray(tags) ? tags : [],
      themeColor: themeColor || '#7C3AED',
      colorPalette,
      sortOrder: nextSortOrder,
    });

    // Update board stats (tileCount)
    await Board.findByIdAndUpdate(boardId, { $inc: { tileCount: 1 } });

    // Log Activity
    await logActivity({
      boardId: tile.boardId,
      userId: req.user._id,
      action: 'TILE_ADDED',
      targetType: 'TILE',
      targetId: tile._id,
      description: `Added card "${tile.caption || 'Untitled'}" to board "${board.title}"`,
    });

    return sendSuccess(res, tile, 'Tile created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a tile
// @route   PUT /api/tiles/:id
// @access  Private
const updateTile = async (req, res, next) => {
  try {
    const { imageUrl, caption, tags, themeColor, positionX, positionY, sortOrder } = req.body;

    const tile = await Tile.findById(req.params.id);
    if (!tile) {
      return sendError(res, 'Tile not found', 404);
    }

    // Verify board ownership or write access
    const board = await Board.findOne({
      _id: tile.boardId,
      $or: [
        { owner: req.user._id },
        { collaborators: { $elemMatch: { user: req.user._id, role: 'editor' } } }
      ]
    });
    if (!board) {
      return sendError(res, 'Access denied', 403);
    }

    if (imageUrl !== undefined) tile.imageUrl = imageUrl.trim();
    if (caption !== undefined) tile.caption = caption.trim();
    if (tags !== undefined) tile.tags = Array.isArray(tags) ? tags : [];
    if (themeColor !== undefined) tile.themeColor = themeColor;
    if (positionX !== undefined) tile.positionX = Number(positionX);
    if (positionY !== undefined) tile.positionY = Number(positionY);
    if (sortOrder !== undefined) tile.sortOrder = Number(sortOrder);

    await tile.save();

    // Log Activity
    await logActivity({
      boardId: tile.boardId,
      userId: req.user._id,
      action: 'TILE_UPDATED',
      targetType: 'TILE',
      targetId: tile._id,
      description: `Updated details of pin "${tile.caption || 'Untitled'}"`,
    });

    return sendSuccess(res, tile, 'Tile updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a tile
// @route   DELETE /api/tiles/:id
// @access  Private
const deleteTile = async (req, res, next) => {
  try {
    const tile = await Tile.findById(req.params.id);
    if (!tile) {
      return sendError(res, 'Tile not found', 404);
    }

    // Verify board ownership or write access
    const board = await Board.findOne({
      _id: tile.boardId,
      $or: [
        { owner: req.user._id },
        { collaborators: { $elemMatch: { user: req.user._id, role: 'editor' } } }
      ]
    });
    if (!board) {
      return sendError(res, 'Access denied', 403);
    }

    await Tile.findByIdAndDelete(req.params.id);

    // Update board stats (tileCount)
    await Board.findByIdAndUpdate(tile.boardId, { $inc: { tileCount: -1 } });

    // Log Activity
    await logActivity({
      boardId: tile.boardId,
      userId: req.user._id,
      action: 'TILE_DELETED',
      targetType: 'TILE',
      targetId: tile._id,
      description: `Removed pin "${tile.caption || 'Untitled'}" from board "${board.title}"`,
    });

    return sendSuccess(res, null, 'Tile deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate a tile
// @route   POST /api/tiles/duplicate/:id
// @access  Private
const duplicateTile = async (req, res, next) => {
  try {
    const originalTile = await Tile.findById(req.params.id);
    if (!originalTile) {
      return sendError(res, 'Tile not found', 404);
    }

    // Verify board ownership or write access
    const board = await Board.findOne({
      _id: originalTile.boardId,
      $or: [
        { owner: req.user._id },
        { collaborators: { $elemMatch: { user: req.user._id, role: 'editor' } } }
      ]
    });
    if (!board) {
      return sendError(res, 'Access denied', 403);
    }

    // Find current max sortOrder
    const maxTile = await Tile.findOne({ boardId: originalTile.boardId }).sort({ sortOrder: -1 }).select('sortOrder').lean();
    const nextSortOrder = maxTile ? (maxTile.sortOrder || 0) + 1 : 0;

    const duplicated = await Tile.create({
      boardId: originalTile.boardId,
      imageUrl: originalTile.imageUrl,
      caption: originalTile.caption ? `${originalTile.caption} (Copy)` : 'Copy',
      tags: originalTile.tags,
      themeColor: originalTile.themeColor,
      colorPalette: originalTile.colorPalette,
      sortOrder: nextSortOrder,
    });

    // Update board stats (tileCount)
    await Board.findByIdAndUpdate(originalTile.boardId, { $inc: { tileCount: 1 } });

    // Log Activity
    await logActivity({
      boardId: duplicated.boardId,
      userId: req.user._id,
      action: 'TILE_ADDED',
      targetType: 'TILE',
      targetId: duplicated._id,
      description: `Duplicated pin "${originalTile.caption || 'Untitled'}" in board "${board.title}"`,
    });

    return sendSuccess(res, duplicated, 'Tile duplicated successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk reorder tiles
// @route   PUT /api/tiles/reorder
// @access  Private
const reorderTiles = async (req, res, next) => {
  try {
    const { tiles } = req.body; // Array: [{ id: 'xxx', sortOrder: 0 }]
    if (!Array.isArray(tiles) || tiles.length === 0) {
      return sendError(res, 'Invalid tiles body', 400);
    }

    // Bulk write operations
    const bulkOps = tiles.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { sortOrder: item.sortOrder } },
      },
    }));

    await Tile.bulkWrite(bulkOps);

    // Fetch one tile to log board context
    const firstTileInfo = await Tile.findById(tiles[0].id).select('boardId').lean();
    if (firstTileInfo) {
      await logActivity({
        boardId: firstTileInfo.boardId,
        userId: req.user._id,
        action: 'TILE_MOVED',
        targetType: 'BOARD',
        targetId: firstTileInfo.boardId,
        description: `Rearranged grid items position structure`,
      });
    }

    return sendSuccess(res, null, 'Tiles reordered successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Upload an image (local file upload)
// @route   POST /api/upload
// @access  Private
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
    }

    const { path: tempPath, filename } = req.file;

    const isProd = process.env.NODE_ENV === 'production';
    const hasCloudinary =
      typeof isCloudinaryConfigured === 'function'
        ? isCloudinaryConfigured()
        : !!isCloudinaryConfigured;

    // Check Cloudinary
    if (hasCloudinary) {
      try {
        const result = await cloudinary.uploader.upload(tempPath, {
          folder: 'moodboard',
          resource_type: 'image',
        });

        // Clean up temp file from server
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }

        return sendSuccess(res, { imageUrl: result.secure_url }, 'Uploaded to Cloudinary successfully');
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failure:', cloudinaryError.message || cloudinaryError);
        if (isProd) {
          if (fs.existsSync(tempPath)) {
            try {
              fs.unlinkSync(tempPath);
            } catch (e) {}
          }
          return sendError(
            res,
            `Cloudinary upload failed: ${cloudinaryError.message || 'Error communicating with Cloudinary'}`,
            500
          );
        }
        // In development, fall through to local fallback
      }
    } else if (isProd) {
      if (fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
        } catch (e) {}
      }
      return sendError(
        res,
        'Cloudinary is not configured. Cloudinary is required for image storage in production.',
        500
      );
    }

    // Local Fallback: Move file to public uploads dir (development only)
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const finalPath = path.join(uploadsDir, filename);
    fs.renameSync(tempPath, finalPath);

    const protocol = req.secure ? 'https' : 'http';
    const localUrl = `${protocol}://${req.headers.host}/uploads/${filename}`;

    return sendSuccess(
      res,
      { imageUrl: localUrl },
      'Uploaded to local disk storage successfully (Cloudinary Fallback)'
    );
  } catch (error) {
    // Delete files, do not leave lingering temp files
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Failed to unlink temp file:', e);
      }
    }
    next(error);
  }
};

// @desc    Proxy download for cross-origin URLs (solves CORS canvas/download block)
// @route   GET /api/tiles/proxy-download
// @access  Private
const proxyDownloadImage = async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) return sendError(res, 'URL is query parameter required', 400);

    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    client.get(url, (imageRes) => {
      if (imageRes.statusCode !== 200) {
        return sendError(res, `Failed to retrieve resource. Status: ${imageRes.statusCode}`, 422);
      }
      
      // Forward standard image Headers
      const contentType = imageRes.headers['content-type'] || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      
      // Try to determine correct file extension based on response MIME type
      let ext = 'jpg';
      if (contentType.includes('png')) ext = 'png';
      else if (contentType.includes('gif')) ext = 'gif';
      else if (contentType.includes('webp')) ext = 'webp';
      else if (contentType.includes('svg')) ext = 'svg';
      else {
        // Try parsing file extension from the URL if MIME type is generic
        const match = url.match(/\.(png|jpg|jpeg|gif|webp|svg)/i);
        if (match) ext = match[1].toLowerCase();
      }

      // Force attachment download trigger
      const defaultFilename = `moodboard_inspiration_${Date.now()}.${ext}`;
      res.setHeader('Content-Disposition', `attachment; filename="${defaultFilename}"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type');
      
      imageRes.pipe(res);
    }).on('error', (err) => {
      console.error('Image proxy download error:', err.message);
      return sendError(res, 'Failed to download the remote image file', 422);
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTiles,
  getTileById,
  createTile,
  updateTile,
  deleteTile,
  duplicateTile,
  reorderTiles,
  uploadImage,
  proxyDownloadImage,
};
