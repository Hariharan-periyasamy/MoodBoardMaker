const mongoose = require('mongoose');
const fs = require('fs');

const logSync = (msg) => {
  try {
    fs.writeSync(2, msg + '\n');
  } catch (e) {
    console.error(msg);
  }
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri || !uri.trim()) {
    logSync('❌ MONGODB_URI environment variable is missing.');
    logSync('Please configure MONGODB_URI in your Render Environment Variables or .env file.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri.trim());
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logSync(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
