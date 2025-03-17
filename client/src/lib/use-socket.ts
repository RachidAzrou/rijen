import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket.IO Connected', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO Disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO Connection error:', error);
      setIsConnected(false);
    });

    return () => {
      console.log('Cleaning up Socket.IO connection');
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = (message: string) => {
    if (!socketRef.current?.connected) {
      console.log('Cannot send - Socket.IO not connected');
      return;
    }

    try {
      const data = JSON.parse(message);
      console.log('Sending Socket.IO message:', data);

      if (data.type === 'updateStatus') {
        socketRef.current.emit('updateStatus', {
          room: data.room,
          status: data.status
        });
      }
    } catch (error) {
      console.error('Failed to send Socket.IO message:', error);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage
  };
}