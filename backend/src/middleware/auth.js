const { verifyToken } = require('../utils/tokenUtils');
const User = require('../models/User');
const { sendError } = require('../utils/responseUtils');

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Not authorized, no token provided', 401);
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 'User not found, token invalid', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired, please log in again', 401);
    }
    return sendError(res, 'Not authorized', 401);
  }
};

module.exports = { protect };
