const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getNotifications)
  .put(markAsRead);

module.exports = router;
