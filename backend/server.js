require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/socket/socketHandler');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  
  const server = http.createServer(app);
  
  // Attach Socket.IO
  const io = new Server(server, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });
  
  initSocket(io);

  server.listen(PORT, () => {
    console.log(`🚀 Socket and HTTP Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  });
};

start();
