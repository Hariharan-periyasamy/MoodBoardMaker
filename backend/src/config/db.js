const mongoose = require('mongoose');

const connectDB = async () => {
  let uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (uri) {
    uri = uri.trim().replace(/^["']+|["']+$/g, '');
  }

  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is missing.');
    console.error('Please configure MONGODB_URI in your Render Environment Variables.');
    setTimeout(() => {
      process.exit(1);
    }, 1000);
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
};

module.exports = connectDB;
