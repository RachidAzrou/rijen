import { useEffect, useRef, useState } from 'react';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const messageQueueRef = useRef<string[]>([]);

  const sendQueuedMessages = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      messageQueueRef.current.forEach(message => {
        console.log('Sending queued message:', message);
        socketRef.current?.send(message);
      });
      messageQueueRef.current = [];
    }
  };

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const connect = () => {
      console.log("Attempting WebSocket connection to:", wsUrl);
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log("WebSocket connected successfully");
        setIsConnected(true);
        sendQueuedMessages();
      };

      socketRef.current.onclose = (event) => {
        console.log("WebSocket disconnected, code:", event.code, "reason:", event.reason);
        setIsConnected(false);
        setTimeout(connect, 2000);
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socketRef.current.onmessage = (event) => {
        console.log("WebSocket message received:", event.data);
      };
    };

    connect();

    return () => {
      console.log("Cleaning up WebSocket connection");
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage: (message: string) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        console.log('Sending message directly:', message);
        socketRef.current.send(message);
      } else {
        console.log('Queueing message:', message);
        messageQueueRef.current.push(message);
      }
    }
  };
}