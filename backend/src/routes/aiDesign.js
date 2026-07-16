const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getBoardRecommendations, analyzeImage } = require('../controllers/aiDesignController');

router.use(protect);

router.get('/board/:boardId', getBoardRecommendations);
router.post('/analyze-image', analyzeImage);

module.exports = router;
