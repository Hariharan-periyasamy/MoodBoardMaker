const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const {
  getTiles,
  getTileById,
  createTile,
  updateTile,
  deleteTile,
  duplicateTile,
  reorderTiles,
  uploadImage,
  proxyDownloadImage,
} = require('../controllers/tileController');
const { extractPalette } = require('../controllers/paletteController');

// All tiles endpoints require authentication
router.use(protect);

// Setup Temp Directory for Multer Uploads
const tempDir = path.join(__dirname, '../../temp_uploads');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File Filter for validating extensions (PNG, JPG, JPEG, WEBP, GIF)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Allowed formats: PNG, JPG, JPEG, WEBP, GIF'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB Max Size Limit
  },
});

// Define endpoints mapping to controller callbacks
router.post('/upload', upload.single('image'), uploadImage);
router.put('/reorder', reorderTiles);
router.post('/duplicate/:id', duplicateTile);
router.get('/proxy-download', proxyDownloadImage);

router.route('/')
  .get(getTiles)
  .post(createTile);

router.route('/:id')
  .get(getTileById)
  .put(updateTile)
  .delete(deleteTile);

router.post('/:id/palette', extractPalette);

// Custom Multer Error handling routing middleware helper
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File is too large. Maximum size allowed is 10MB' });
    }
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

module.exports = router;
