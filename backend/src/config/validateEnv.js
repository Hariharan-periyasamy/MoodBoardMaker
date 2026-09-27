/**
 * Startup Environment Variable Validator
 * Validates required configuration before starting database and HTTP services.
 */

const validateEnv = () => {
  const missing = [];

  // MONGODB_URI is strictly required in all environments
  if (!process.env.MONGODB_URI || !process.env.MONGODB_URI.trim()) {
    missing.push('MONGODB_URI');
  }

  // JWT_SECRET is strictly required for auth token signing and verification
  if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
    missing.push('JWT_SECRET');
  }

  // Cloudinary credentials required in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_CLOUD_NAME.trim()) {
      missing.push('CLOUDINARY_CLOUD_NAME');
    }
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_KEY.trim()) {
      missing.push('CLOUDINARY_API_KEY');
    }
    if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_SECRET.trim()) {
      missing.push('CLOUDINARY_API_SECRET');
    }
  }

  if (missing.length > 0) {
    console.error('❌ Startup failed: Required environment variable(s) missing:');
    missing.forEach((varName) => {
      console.error(`   - ${varName}`);
    });

    if (missing.includes('MONGODB_URI')) {
      console.error('\n   MONGODB_URI environment variable is missing.');
      console.error('   Please provide a valid MongoDB connection string in MONGODB_URI.');
    }

    process.exit(1);
  }

  // Warning for non-production environments when Cloudinary is not configured
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.warn(
      '⚠️ Cloudinary credentials missing in development. Local storage fallback will be used.'
    );
  }
};

module.exports = validateEnv;
