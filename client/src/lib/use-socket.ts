import { useEffect, useRef, useState, useCallback } from 'react';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      console.log('[WebSocket] Connecting to:', wsUrl);

      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
      };

      socketRef.current.onclose = () => {
        console.log('[WebSocket] Disconnected, attempting to reconnect...');
        setIsConnected(false);

        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        // Attempt to reconnect after 1 second
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[WebSocket] Reconnecting...');
          connect();
        }, 1000);
      };

      socketRef.current.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };

    } catch (error) {
      console.error('[WebSocket] Setup error:', error);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.log('[WebSocket] Not connected, attempting to reconnect...');
      connect();
      return;
    }

    try {
      socketRef.current.send(message);
    } catch (error) {
      console.error('[WebSocket] Failed to send message:', error);
    }
  }, [connect]);

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage
  };
}