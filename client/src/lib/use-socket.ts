import { useEffect, useRef, useState, useCallback } from 'react';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const messageQueueRef = useRef<string[]>([]);

  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  };

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      console.log('[WebSocket] Connecting to:', wsUrl);

      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('[WebSocket] Connected successfully');
        setIsConnected(true);

        // Send any queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          if (message) socketRef.current?.send(message);
        }
      };

      socketRef.current.onclose = () => {
        console.log('[WebSocket] Connection closed');
        setIsConnected(false);

        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        // Attempt to reconnect after 2 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[WebSocket] Attempting to reconnect...');
          connect();
        }, 2000);
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
        socketRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: string) => {
    console.log('[WebSocket] Sending message:', message);

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      console.log('[WebSocket] Queueing message for later');
      messageQueueRef.current.push(message);

      // If socket is closed, attempt to reconnect
      if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
        connect();
      }
    }
  }, [connect]);

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage
  };
}