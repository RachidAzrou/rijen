import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from "@/hooks/use-toast";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (socketRef.current?.connected) {
      console.log('[Socket.IO] Already connected, skipping connection');
      return;
    }

    console.log('[Socket.IO] Initializing connection...');

    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected successfully:', socket.id);
      setIsConnected(true);
      toast({
        description: "Verbinding met server hersteld",
        duration: 2000,
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected:', reason);
      setIsConnected(false);
      toast({
        variant: "destructive",
        description: "Verbinding met server verbroken",
      });
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket.IO] Connection error:', error);
      setIsConnected(false);
      toast({
        variant: "destructive",
        description: "Kan geen verbinding maken met server",
      });
    });

    socket.on('error', (error) => {
      console.error('[Socket.IO] Server error:', error);
      toast({
        variant: "destructive",
        description: "Er is een fout opgetreden",
      });
    });

    return () => {
      console.log('[Socket.IO] Cleaning up connection');
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = (message: string) => {
    if (!socketRef.current?.connected) {
      console.warn('[Socket.IO] Cannot send - not connected');
      toast({
        variant: "destructive",
        description: "Kan geen updates versturen - geen verbinding",
      });
      return;
    }

    try {
      const data = JSON.parse(message);
      console.log('[Socket.IO] Sending message:', data);

      if (data.type === 'updateStatus') {
        socketRef.current.emit('updateStatus', {
          room: data.room,
          status: data.status
        });
      }
    } catch (error) {
      console.error('[Socket.IO] Failed to send message:', error);
      toast({
        variant: "destructive",
        description: "Kan geen update versturen",
      });
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage
  };
}