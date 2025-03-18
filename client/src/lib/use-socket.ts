import { useEffect, useRef, useState } from 'react';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      // Use /api/websocket for Vercel deployment
      const wsUrl = `${protocol}//${host}/api/websocket`;

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
      };

      socketRef.current.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);

        // Attempt to reconnect after a delay
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[WebSocket] Attempting to reconnect...');
          connect();
        }, 2000);
      };

      socketRef.current.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const sendMessage = (message: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot send - not connected');
      return false;
    }

    try {
      console.log('[WebSocket] Sending:', JSON.parse(message));
      socketRef.current.send(message);
      return true;
    } catch (error) {
      console.error('[WebSocket] Failed to send:', error);
      return false;
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage
  };
}