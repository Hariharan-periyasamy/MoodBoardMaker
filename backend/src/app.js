const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { isOriginAllowed } = require('./utils/corsUtils');

const app = express();

// CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  })
);

// Serve uploads static files (Cloudinary Fallback storage support for dev)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database Health Check Endpoint (Render & Monitoring)
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    return res.status(200).json({
      status: 'ok',
      database: 'connected',
    });
  }

  return res.status(503).json({
    status: 'error',
    database: 'disconnected',
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/boards', require('./routes/boards'));
app.use('/api/tiles', require('./routes/tiles'));
app.use('/api/share', require('./routes/share'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/search', require('./routes/search'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/ai-design', require('./routes/aiDesign'));

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
