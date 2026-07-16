const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getActivities } = require('../controllers/activityController');

// Secure router with protect middleware
router.get('/', protect, getActivities);

module.exports = router;
