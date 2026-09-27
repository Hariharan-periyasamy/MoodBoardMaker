import { useEffect } from 'react';
import { io } from 'socket.io-client';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SOCKET_URL = rawApiUrl.replace(/\/api\/?$/, '');

let socketInstance = null;

export const getSocket = () => {
  const token = localStorage.getItem('mb_token') || localStorage.getItem('token');

  if (!token) {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
    return null;
  }

  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      auth: { token },
      autoConnect: false,
    });
  } else {
    // Update token if it changed
    socketInstance.auth = { token };
  }

  return socketInstance;
};

export const useSocket = () => {
  useEffect(() => {
    const socket = getSocket();
    if (socket && !socket.connected) {
      socket.connect();
    }

    return () => {
      // Keep it open as singleton but check auth
    };
  }, []);

  return getSocket();
};
