const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  enableSharing,
  disableSharing,
  regenerateToken,
  getSharedBoard,
} = require('../controllers/shareController');

// Anonymous access endpoint
router.get('/:token', getSharedBoard);

// Authenticated board access endpoints
router.post('/:boardId', protect, enableSharing);
router.delete('/:boardId', protect, disableSharing);
router.post('/regenerate/:boardId', protect, regenerateToken);

module.exports = router;
