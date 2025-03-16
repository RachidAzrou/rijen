import { useEffect, useRef, useState } from 'react';

const ROOM_STATUSES_KEY = 'room_statuses';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const messageQueueRef = useRef<string[]>([]);

  // Load initial statuses from localStorage
  const loadStoredStatuses = () => {
    try {
      const stored = localStorage.getItem(ROOM_STATUSES_KEY);
      console.log('Loading stored statuses:', stored);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading stored statuses:', error);
      return null;
    }
  };

  // Save statuses to localStorage
  const saveStatuses = (statuses: Record<string, string>) => {
    try {
      console.log('Saving statuses to localStorage:', statuses);
      localStorage.setItem(ROOM_STATUSES_KEY, JSON.stringify(statuses));
    } catch (error) {
      console.error('Error saving statuses:', error);
    }
  };

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
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected');
        return;
      }

      console.log("Attempting WebSocket connection to:", wsUrl);
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log("WebSocket connected successfully");
        setIsConnected(true);

        // Send request for initial status
        const storedStatuses = loadStoredStatuses();
        if (storedStatuses) {
          console.log('Syncing stored statuses:', storedStatuses);
          socketRef.current?.send(JSON.stringify({
            type: "syncStatus",
            data: storedStatuses
          }));
        } else {
          console.log('Requesting initial status');
          socketRef.current?.send(JSON.stringify({ type: "getInitialStatus" }));
        }

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
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket raw message received:", event.data);
          console.log("WebSocket parsed message:", data);

          // Save status updates to localStorage
          if (data.type === "initialStatus" || data.type === "statusUpdated") {
            const statuses = data.type === "initialStatus" ? data.data : {
              [data.room]: data.status
            };
            console.log('Saving statuses update:', statuses);
            saveStatuses(statuses);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
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

  const sendMessage = (message: string) => {
    console.log('Attempting to send message:', message);

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('Socket is open, sending directly');
      socketRef.current.send(message);
    } else {
      console.log('Socket not ready, queueing message');
      messageQueueRef.current.push(message);
      // If socket is closed, try to reconnect
      if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
        console.log('Socket is closed, attempting to reconnect...');
        socketRef.current = null; // Reset the socket reference
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        socketRef.current = new WebSocket(wsUrl);
      }
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage
  };
}