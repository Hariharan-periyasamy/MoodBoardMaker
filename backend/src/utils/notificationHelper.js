const Notification = require('../models/Notification');

/**
 * Creates and saves in-app notification records.
 */
const createNotification = async ({ userId, type, message, boardId = null, link = '' }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      message,
      boardId,
      link,
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification helper stub:', error.message);
  }
};

module.exports = { createNotification };
