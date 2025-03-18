import { useEffect, useRef, useState, useCallback } from 'react';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }

    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.log('[WebSocket] Max reconnection attempts reached');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    console.log('[WebSocket] Connecting to:', wsUrl);

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;

      // Clear any existing reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    socket.onclose = () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);
      socketRef.current = null;

      // Increment reconnection attempts
      reconnectAttemptsRef.current += 1;

      // Attempt to reconnect with exponential backoff
      const timeout = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
      console.log(`[WebSocket] Attempting to reconnect in ${timeout}ms (attempt ${reconnectAttemptsRef.current})`);

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, timeout);
    };

    socket.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      socket.close();
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      console.log('[WebSocket] Cleaning up connection');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: string) => {
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
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    reconnect: connect
  };
}