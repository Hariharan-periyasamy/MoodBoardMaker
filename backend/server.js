require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const validateEnv = require('./src/config/validateEnv');
const connectDB = require('./src/config/db');
const { initCloudinary } = require('./src/config/cloudinary');
const { isOriginAllowed } = require('./src/utils/corsUtils');
const { initSocket } = require('./src/socket/socketHandler');

const PORT = process.env.PORT || 5000;

const start = async () => {
  // 1. Validate required environment variables
  validateEnv();

  // 2. Connect to MongoDB Atlas (clean exit on failure)
  await connectDB();

  // 3. Initialize Cloudinary
  initCloudinary();

  // 4. Initialize Express
  const app = require('./src/app');

  // 5. Initialize HTTP server
  const server = http.createServer(app);

  // 6. Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Socket.IO Not allowed by CORS: ${origin}`));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  initSocket(io);

  // 7. Start HTTP server
  server.listen(PORT, () => {
    console.log(`🚀 Socket and HTTP Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

start();
