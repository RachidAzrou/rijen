import { useEffect, useRef, useState } from 'react';

const ROOM_STATUSES_KEY = 'room_statuses';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const messageQueueRef = useRef<string[]>([]);

  const getWebSocketUrl = () => {
    // Development environment
    if (process.env.NODE_ENV === 'development') {
      return `ws://${window.location.hostname}:5000/ws`;
    }

    // Production environment - Vercel or Firebase
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Check if we're on Vercel
    if (process.env.VERCEL) {
      return `${protocol}//${window.location.host}/ws`;
    }
    // Default to Firebase
    return `${protocol}//${window.location.host}/ws`;
  };

  const loadStoredStatuses = () => {
    try {
      const stored = localStorage.getItem(ROOM_STATUSES_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading stored statuses:', error);
      return null;
    }
  };

  const saveStatuses = (statuses: Record<string, string>) => {
    try {
      localStorage.setItem(ROOM_STATUSES_KEY, JSON.stringify(statuses));
    } catch (error) {
      console.error('Error saving statuses:', error);
    }
  };

  const sendQueuedMessages = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      messageQueueRef.current.forEach(message => {
        socketRef.current?.send(message);
      });
      messageQueueRef.current = [];
    }
  };

  useEffect(() => {
    const wsUrl = getWebSocketUrl();
    console.log('Connecting to WebSocket at:', wsUrl);

    const connect = () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        sendQueuedMessages();

        // Request initial status
        const storedStatuses = loadStoredStatuses();
        if (storedStatuses) {
          socketRef.current?.send(JSON.stringify({
            type: "syncStatus",
            data: storedStatuses
          }));
        } else {
          socketRef.current?.send(JSON.stringify({ type: "getInitialStatus" }));
        }
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        setTimeout(connect, 2000);
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);

          if (data.type === "initialStatus" || data.type === "statusUpdated") {
            const statuses = data.type === "initialStatus" ? data.data : {
              [data.room]: data.status
            };
            saveStatuses(statuses);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const sendMessage = (message: string) => {
    console.log('Attempting to send message:', message);
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      messageQueueRef.current.push(message);
      if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
        const wsUrl = getWebSocketUrl();
        socketRef.current = new WebSocket(wsUrl);
      }
    }
  };

  return {
    isConnected,
    sendMessage
  };
}