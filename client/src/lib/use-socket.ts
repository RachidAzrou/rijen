import { useEffect, useRef, useState, useCallback } from 'react';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

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
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);
        // Reconnect after 1 second
        setTimeout(connect, 1000);
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
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.log('[WebSocket] Not connected, reconnecting...');
      connect();
      return;
    }

    try {
      console.log('[WebSocket] Sending:', message);
      socketRef.current.send(message);
    } catch (error) {
      console.error('[WebSocket] Send error:', error);
    }
  }, [connect]);

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage
  };
}