import { useEffect, useRef, useState } from 'react';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout;

    function connect() {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        console.log('Connecting to WebSocket:', wsUrl);

        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected, reconnecting...');
          setIsConnected(false);
          socketRef.current = null;
          reconnectTimer = setTimeout(connect, 1000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

      } catch (error) {
        console.error('WebSocket connection error:', error);
        reconnectTimer = setTimeout(connect, 1000);
      }
    }

    connect();

    // Cleanup
    return () => {
      clearTimeout(reconnectTimer);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);

  const sendMessage = (message: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.log('Cannot send - WebSocket not connected');
      return;
    }

    try {
      console.log('Sending:', JSON.parse(message));
      socketRef.current.send(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage
  };
}