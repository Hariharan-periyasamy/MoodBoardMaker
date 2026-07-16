import { useState, useEffect, useRef } from 'react';
import { getSocket } from './useSocket';

export const useBoardSocket = (boardId, onTileMutate) => {
  const [collaborators, setCollaborators] = useState([]);
  const [cursors, setCursors] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    if (!boardId) return;

    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    // Join room
    socket.emit('join:board', { boardId });

    // Handle collaborators updates
    socket.on('presence:update', (users) => {
      setCollaborators(users);
    });

    // Handle incoming cursor movements of other users
    socket.on('cursor:updated', (data) => {
      // Do not tract self
      if (data.socketId === socket.id) return;
      setCursors((prev) => ({
        ...prev,
        [data.socketId]: data,
      }));
    });

    // Handle collaborator exit
    socket.on('cursor:removed', ({ socketId }) => {
      setCursors((prev) => {
        const copy = { ...prev };
        delete copy[socketId];
        return copy;
      });
    });

    // Handle tile mutated event from other clients
    socket.on('tile:mutated', (eventDetails) => {
      if (onTileMutate) {
        onTileMutate(eventDetails);
      }
    });

    return () => {
      socket.emit('leave:board');
      socket.off('presence:update');
      socket.off('cursor:updated');
      socket.off('cursor:removed');
      socket.off('tile:mutated');
    };
  }, [boardId]);

  // Emit cursor movements
  const emitCursorMove = (e, containerRef) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100; // relative percentage 0-100
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    socket.emit('cursor:move', { x, y });
  };

  // Toggle user editing state indicator
  const setEditingStatus = (isEditing) => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit('user:editing', { isEditing });
    }
  };

  // Broadcast backend updates / query cache flush request
  const emitTileMutation = (actionType, tileData = null) => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit('tile:mutate', { boardId, type: actionType, tile: tileData });
    }
  };

  return {
    collaborators,
    cursors,
    emitCursorMove,
    setEditingStatus,
    emitTileMutation,
  };
};
