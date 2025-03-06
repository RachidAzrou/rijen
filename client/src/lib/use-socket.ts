import { useEffect, useRef, useState } from 'react';
import { getDatabase, ref, onValue, set } from "firebase/database";
import app from './firebase';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const isVercel = window.location.hostname.includes('vercel.app');

    if (isVercel) {
      // Use Firebase Realtime Database for Vercel deployment
      const db = getDatabase(app);
      const roomsRef = ref(db, 'rooms');

      // Listen for changes
      const unsubscribe = onValue(roomsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Emit the same format as WebSocket
          const event = new MessageEvent('message', {
            data: JSON.stringify({
              type: 'initialStatus',
              data
            })
          });
          if (socketRef.current?.onmessage) {
            socketRef.current.onmessage(event);
          }
        }
      });

      // Create a Firebase-like WebSocket interface
      socketRef.current = {
        readyState: WebSocket.OPEN,
        send: (message: string) => {
          const data = JSON.parse(message);
          if (data.type === 'updateStatus') {
            set(ref(db, `rooms/${data.room}`), data.status);
          }
        },
        close: () => {
          unsubscribe();
          setIsConnected(false);
        }
      } as any;

      setIsConnected(true);
      return () => {
        unsubscribe();
        setIsConnected(false);
      };
    } else {
      // Use WebSocket for local development
      const getWebSocketUrl = () => {
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

            if (socketRef.current?.readyState === WebSocket.OPEN) {
              console.log("Requesting initial status");
              socketRef.current.send(JSON.stringify({ type: "getInitialStatus" }));
            }
          };

          socketRef.current.onclose = () => {
            console.log("WebSocket disconnected");
            setIsConnected(false);
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }
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
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
  };
}