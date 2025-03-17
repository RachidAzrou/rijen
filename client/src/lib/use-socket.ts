import { useEffect, useRef, useState, useCallback } from 'react';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      console.log('[WebSocket] Connecting to:', wsUrl);

      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('[WebSocket] Connection established');
        setIsConnected(true);
      };

      socketRef.current.onclose = () => {
        console.log('[WebSocket] Connection closed, attempting to reconnect...');
        setIsConnected(false);
        setTimeout(connect, 1000);
      };

      socketRef.current.onerror = (error) => {
        console.error('[WebSocket] Connection error:', error);
      };

    } catch (error) {
      console.error('[WebSocket] Setup error:', error);
    }
  }, []);

  useEffect(() => {
    connect();
    const interval = setInterval(() => {
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        console.log('[WebSocket] Checking connection - disconnected, reconnecting...');
        connect();
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.log('[WebSocket] Cannot send message - not connected');
      return;
    }

    try {
      console.log('[WebSocket] Sending message:', message);
      socketRef.current.send(message);
    } catch (error) {
      console.error('[WebSocket] Error sending message:', error);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage
  };
}