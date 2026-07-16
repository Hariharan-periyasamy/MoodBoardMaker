const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { globalSearch } = require('../controllers/searchController');

// Secure route with protect middleware
router.get('/', protect, globalSearch);

module.exports = router;
