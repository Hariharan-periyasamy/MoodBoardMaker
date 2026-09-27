const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    console.error('❌ MONGODB_URI environment variable is missing.');
    console.error('Please configure MONGODB_URI in your environment variables or .env file.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri.trim());
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
