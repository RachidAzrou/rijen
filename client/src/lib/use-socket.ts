import { useEffect, useRef, useState } from 'react';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const getWebSocketUrl = () => {
      // For Vercel deployment
      if (window.location.hostname.includes('vercel.app')) {
        return 'wss://sufuf-c6cd6-default-rtdb.europe-west1.firebasedatabase.app';
      }
      // For local development
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.host}/ws`;
    };

    const connect = () => {
      try {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          console.log("WebSocket already connected");
          return;
        }

        console.log("Attempting WebSocket connection...");
        const wsUrl = getWebSocketUrl();
        socketRef.current = new WebSocket(wsUrl);

        socketRef.current.onopen = () => {
          console.log("WebSocket connected");
          setIsConnected(true);

          // Request initial status when connecting
          if (socketRef.current?.readyState === WebSocket.OPEN) {
            console.log("Requesting initial status");
            socketRef.current.send(JSON.stringify({ type: "getInitialStatus" }));
          }
        };

        socketRef.current.onclose = () => {
          console.log("WebSocket disconnected");
          setIsConnected(false);
          // Clear any existing reconnect timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          // Try to reconnect after 2 seconds
          reconnectTimeoutRef.current = setTimeout(connect, 2000);
        };

        socketRef.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current?.close();
          }
        };
      } catch (error) {
        console.error("Error creating WebSocket connection:", error);
        // Try to reconnect after error
        reconnectTimeoutRef.current = setTimeout(connect, 2000);
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
  };
}