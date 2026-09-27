const fs = require('fs');

/**
 * Synchronous error logger to ensure logs are never dropped
 * by process.exit() on cloud platforms (Render, Linux, Docker).
 */
const logSync = (msg) => {
  try {
    fs.writeSync(2, msg + '\n');
  } catch (e) {
    console.error(msg);
  }
};

const validateEnv = () => {
  // Support MONGO_URI if user configured it in Render dashboard
  if (!process.env.MONGODB_URI && process.env.MONGO_URI) {
    process.env.MONGODB_URI = process.env.MONGO_URI;
    logSync('ℹ️ Using MONGO_URI environment variable for MONGODB_URI.');
  }

  const missing = [];

  // MONGODB_URI is strictly required
  if (!process.env.MONGODB_URI || !process.env.MONGODB_URI.trim()) {
    missing.push('MONGODB_URI');
  }

  // Handle missing variables
  if (missing.length > 0) {
    logSync('\n======================================================');
    logSync('❌ STARTUP FAILED: REQUIRED ENVIRONMENT VARIABLE MISSING');
    logSync('======================================================');
    missing.forEach((v) => {
      logSync(`   - ${v}`);
    });
    logSync('\n👉 ACTION REQUIRED IN RENDER:');
    logSync('   1. Go to your Render Dashboard -> moodboard-api -> Environment');
    logSync('   2. Add or update key: MONGODB_URI');
    logSync('   3. Value: mongodb+srv://<user>:<password>@<cluster>.mongodb.net/moodboard?retryWrites=true&w=majority');
    logSync('   4. Click Save Changes & Redeploy.\n');
    logSync('======================================================\n');

    process.exit(1);
  }

  // Warning for missing JWT_SECRET
  if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
    logSync('⚠️ WARNING: JWT_SECRET is not set. A default fallback will be used. Please set JWT_SECRET in production.');
    process.env.JWT_SECRET = 'moodboard_jwt_secret_fallback_key_2026';
  }

  // Warning for missing Cloudinary credentials
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    logSync(
      '⚠️ WARNING: Cloudinary credentials not fully configured. Image uploads will require Cloudinary in production.'
    );
  }
};

module.exports = validateEnv;
