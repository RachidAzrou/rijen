import { useEffect, useRef, useState } from 'react';
import { getDatabase, ref, onValue, set } from "firebase/database";
import app from './firebase';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const isVercel = window.location.hostname.includes('vercel.app');

    if (isVercel) {
      // Use Firebase Realtime Database for Vercel deployment
      try {
        const db = getDatabase(app);
        console.log('Firebase Database initialized');

        // Initialize rooms data if it doesn't exist
        const roomsRef = ref(db, 'rooms');
        const initialData = {
          'beneden': 'OFF',
          'first-floor': 'OFF',
          'garage': 'OFF'
        };
        try {
          set(roomsRef, initialData)
            .then(() => console.log('Rooms initialized in Firebase'))
            .catch(error => console.error('Error initializing rooms:', error));
        } catch (error) {
          console.error('Error initializing rooms:', error);
        }

        // Listen for changes
        const unsubscribe = onValue(roomsRef, (snapshot) => {
          try {
            const data = snapshot.val();
            console.log('Received data from Firebase:', data);
            if (data) {
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
          } catch (error) {
            console.error('Error processing Firebase data:', error);
          }
        }, (error) => {
          console.error('Firebase onValue error:', error);
        });

        // Create a Firebase-like WebSocket interface
        socketRef.current = {
          readyState: WebSocket.OPEN,
          send: (message: string) => {
            try {
              const data = JSON.parse(message);
              if (data.type === 'updateStatus') {
                const roomRef = ref(db, `rooms/${data.room}`);
                set(roomRef, data.status)
                  .then(() => console.log('Status updated successfully:', data.room, data.status))
                  .catch(error => console.error('Error updating room status:', error));
              }
            } catch (error) {
              console.error('Error processing message:', error);
            }
          },
          close: () => {
            unsubscribe();
            setIsConnected(false);
          },
          onmessage: null as any
        } as WebSocket;

        setIsConnected(true);
        console.log('Firebase WebSocket interface initialized');

        return () => {
          unsubscribe();
          setIsConnected(false);
        };
      } catch (error) {
        console.error('Error setting up Firebase:', error);
        setIsConnected(false);
      }
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
          };

          socketRef.current.onerror = (error) => {
            console.error("WebSocket error:", error);
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current?.close();
            }
          };
        } catch (error) {
          console.error("Error creating WebSocket connection:", error);
        }
      };

      connect();

      return () => {
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