import { useEffect, useRef, useState } from 'react';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    function connect() {
      console.log('Connecting to WebSocket:', wsUrl);
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setTimeout(connect, 1000);
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const sendMessage = (message: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('Sending message:', message);
      socketRef.current.send(message);
    } else {
      console.log('WebSocket not connected, cannot send message');
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage
  };
}