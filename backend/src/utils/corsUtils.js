/**
 * CORS Configuration Utility
 * Supports production FRONTEND_URL and local development origins
 */

const getAllowedOrigins = () => {
  const defaults = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
  ];

  if (process.env.FRONTEND_URL) {
    const urls = process.env.FRONTEND_URL
      .split(',')
      .map((u) => u.trim().replace(/\/+$/, ''))
      .filter(Boolean);
    defaults.push(...urls);
  }

  return [...new Set(defaults)];
};

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow non-browser requests (Postman, mobile apps, health checks)
  const normalizedOrigin = origin.replace(/\/+$/, '');
  const allowed = getAllowedOrigins();
  return allowed.includes(normalizedOrigin);
};

module.exports = {
  getAllowedOrigins,
  isOriginAllowed,
};
