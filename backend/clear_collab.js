const mongoose = require('mongoose');
const Board = require('./src/models/Board');
const Notification = require('./src/models/Notification');
require('dotenv').config();

const clearCollabs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Remove collaborators from all boards
    const result = await Board.updateMany({}, { $set: { collaborators: [] } });
    console.log('Updated boards:', result);

    // Delete all Notifications
    const deleteNotif = await Notification.deleteMany({});
    console.log('Deleted notifications:', deleteNotif);

    process.exit(0);
  } catch (err) {
    console.error('Error clearing database:', err.message);
    process.exit(1);
  }
};

clearCollabs();
