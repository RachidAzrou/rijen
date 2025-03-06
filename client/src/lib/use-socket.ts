import { useEffect, useRef, useState } from 'react';
import { getDatabase, ref, onValue, set } from "firebase/database";
import app from './firebase';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    try {
      const db = getDatabase(app);
      const roomsRef = ref(db, 'rooms');

      // Listen for changes
      const unsubscribe = onValue(roomsRef, (snapshot) => {
        try {
          const data = snapshot.val() || {
            'beneden': 'OFF',
            'first-floor': 'OFF',
            'garage': 'OFF'
          };

          if (socketRef.current?.onmessage) {
            const event = new MessageEvent('message', {
              data: JSON.stringify({
                type: 'initialStatus',
                data
              })
            });
            socketRef.current.onmessage(event);
          }
          setIsConnected(true);
        } catch (error) {
          console.error('Error handling Firebase data:', error);
          setError(error.message);
        }
      });

      // Create a Firebase-like interface
      socketRef.current = {
        readyState: 1, // WebSocket.OPEN
        send: (message: string) => {
          try {
            const data = JSON.parse(message);
            if (data.type === 'updateStatus') {
              const roomRef = ref(db, `rooms/${data.room}`);
              set(roomRef, data.status);
            }
          } catch (error) {
            console.error('Error sending message:', error);
          }
        },
        close: () => {
          unsubscribe();
          setIsConnected(false);
        }
      };

      return () => {
        unsubscribe();
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      setError(error.message);
      setIsConnected(false);
    }
  }, []);

  if (error) {
    console.error('Socket error:', error);
  }

  return {
    socket: socketRef.current,
    isConnected,
    error
  };
}