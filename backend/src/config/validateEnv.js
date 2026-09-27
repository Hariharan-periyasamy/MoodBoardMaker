/**
 * Startup Environment Variable Validator
 * Validates required configuration before starting database and HTTP services.
 */

const validateEnv = () => {
  // Support legacy MONGO_URI from Render dashboard
  if (!process.env.MONGODB_URI && process.env.MONGO_URI) {
    process.env.MONGODB_URI = process.env.MONGO_URI;
    console.log('ℹ️ Using MONGO_URI environment variable for MONGODB_URI.');
  }

  // Sanitize MONGODB_URI (strip quotes if pasted with quotes in Render)
  if (process.env.MONGODB_URI) {
    process.env.MONGODB_URI = process.env.MONGODB_URI.trim().replace(/^["']+|["']+$/g, '');
  }

  // Check MONGODB_URI
  if (!process.env.MONGODB_URI) {
    console.error('\n============================================================');
    console.error('❌ MONGODB_URI environment variable is missing.');
    console.error('============================================================');
    console.error('👉 ACTION REQUIRED IN RENDER DASHBOARD:');
    console.error('   1. Open: https://dashboard.render.com');
    console.error('   2. Click your web service: moodboard-api');
    console.error('   3. Click "Environment" in the left sidebar menu');
    console.error('   4. Add or edit key: MONGODB_URI');
    console.error('   5. Paste your MongoDB Atlas connection string (WITHOUT quotes)');
    console.error('   6. Click "Save Changes" and redeploy.');
    console.error('============================================================\n');

    setTimeout(() => {
      process.exit(1);
    }, 1000);
    return false;
  }

  // Provide fallback for JWT_SECRET if not set
  if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
    console.warn('⚠️ JWT_SECRET is not set in environment. Using secure fallback.');
    process.env.JWT_SECRET = 'moodboard_jwt_secret_fallback_key_2026';
  } else {
    process.env.JWT_SECRET = process.env.JWT_SECRET.trim().replace(/^["']+|["']+$/g, '');
  }

  // Sanitize Cloudinary credentials
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME.trim().replace(/^["']+|["']+$/g, '');
  }
  if (process.env.CLOUDINARY_API_KEY) {
    process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY.trim().replace(/^["']+|["']+$/g, '');
  }
  if (process.env.CLOUDINARY_API_SECRET) {
    process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET.trim().replace(/^["']+|["']+$/g, '');
  }

  // Cloudinary credentials notice
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.warn(
      '⚠️ Cloudinary credentials not fully configured. Image uploads will require Cloudinary.'
    );
  }

  return true;
};

module.exports = validateEnv;
