const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

const initCloudinary = () => {
  if (isCloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('✅ Cloudinary Configured Successfully');
    return true;
  }

  if (process.env.NODE_ENV === 'production') {
    console.error(
      '❌ Cloudinary Configuration Error: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are required in production.'
    );
  } else {
    console.warn(
      '⚠️ Cloudinary environment variables are missing! Backend will fall back to local disk storage in development mode.'
    );
  }
  return false;
};

// Auto-configure if variables are already loaded
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

module.exports = {
  cloudinary,
  initCloudinary,
  isCloudinaryConfigured,
};
