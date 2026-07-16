const { verifyToken } = require('../utils/tokenUtils');
const User = require('../models/User');

// Memory store for online board rooms: boardId -> Map(socketId -> userInfo)
const boardPresences = new Map();

const initSocket = (io) => {
  // Middleware to authenticate socket connections via JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = {
        id: user._id.toString(),
        name: user.name,
        avatarColor: user.avatarColor,
        email: user.email,
      };
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    let currentBoardId = null;

    // Join room for board collaboration
    socket.on('join:board', ({ boardId }) => {
      if (!boardId) return;

      currentBoardId = boardId;
      const roomName = `board:${boardId}`;
      socket.join(roomName);

      // Setup room in memory presence map if not existing
      if (!boardPresences.has(boardId)) {
        boardPresences.set(boardId, new Map());
      }

      const roomMap = boardPresences.get(boardId);
      
      // Store user presence
      roomMap.set(socket.id, {
        socketId: socket.id,
        userId: socket.user.id,
        name: socket.user.name,
        avatarColor: socket.user.avatarColor,
        joinedAt: new Date(),
        isEditing: false,
      });

      // Broadcast list of contemporary participants to all room members
      io.to(roomName).emit('presence:update', Array.from(roomMap.values()));

      console.log(`👤 Socket ${socket.id} (${socket.user.name}) joined room: ${roomName}`);
    });

    // Broadcast live cursor positioning
    socket.on('cursor:move', (coordinates) => {
      if (!currentBoardId) return;
      socket.to(`board:${currentBoardId}`).emit('cursor:updated', {
        userId: socket.user.id,
        socketId: socket.id,
        name: socket.user.name,
        avatarColor: socket.user.avatarColor,
        x: coordinates.x,
        y: coordinates.y,
      });
    });

    // Toggle live editing status
    socket.on('user:editing', ({ isEditing }) => {
      if (!currentBoardId) return;
      const roomMap = boardPresences.get(currentBoardId);
      if (roomMap && roomMap.has(socket.id)) {
        const userObj = roomMap.get(socket.id);
        userObj.isEditing = isEditing;
        // Broadcast updated room presence list to everyone
        io.to(`board:${currentBoardId}`).emit('presence:update', Array.from(roomMap.values()));
      }
    });

    // Broadcast mutation event to refresh query clients
    socket.on('tile:mutate', (eventDetails) => {
      if (!currentBoardId) return;
      // Broadcast change details to everyone in room EXCEPT sender
      socket.to(`board:${currentBoardId}`).emit('tile:mutated', eventDetails);
    });

    // Leave current room / disconnect
    const handleLeaveRoom = () => {
      if (!currentBoardId) return;

      const roomMap = boardPresences.get(currentBoardId);
      if (roomMap) {
        roomMap.delete(socket.id);
        
        const roomName = `board:${currentBoardId}`;
        
        // Broadcast update list
        io.to(roomName).emit('presence:update', Array.from(roomMap.values()));
        
        // Emit cursor removal
        socket.to(roomName).emit('cursor:removed', { socketId: socket.id });

        if (roomMap.size === 0) {
          boardPresences.delete(currentBoardId);
        }
      }
    };

    socket.on('leave:board', () => {
      handleLeaveRoom();
      if (currentBoardId) {
        socket.leave(`board:${currentBoardId}`);
        currentBoardId = null;
      }
    });

    socket.on('disconnect', () => {
      handleLeaveRoom();
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initSocket };
