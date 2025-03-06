import React, { useState, useEffect } from 'react';
import { database } from "./firebase";
import { ref, onValue, set } from "firebase/database";

type RoomStatus = 'OK' | 'NOK' | 'OFF';
type RoomStatuses = Record<string, RoomStatus>;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageHandler, setMessageHandler] = useState<((data: RoomStatuses) => void) | null>(null);

  useEffect(() => {
    try {
      const roomsRef = ref(database, 'rooms');
      let unsubscribe: (() => void) | null = null;

      // Initialize rooms data
      const initialData: RoomStatuses = {
        'beneden': 'OFF',
        'first-floor': 'OFF',
        'garage': 'OFF'
      };

      // Set initial data if not exists
      set(roomsRef, initialData).catch(console.error);

      // Listen for changes
      unsubscribe = onValue(roomsRef, (snapshot) => {
        try {
          const data = snapshot.val() || initialData;
          setIsConnected(true);

          if (messageHandler) {
            messageHandler(data);
          }
        } catch (error: any) {
          console.error('Firebase data handling error:', error);
          setError(error.message);
          setIsConnected(false);
        }
      }, (error) => {
        console.error('Firebase subscription error:', error);
        setError(error.message);
        setIsConnected(false);
      });

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
        setIsConnected(false);
      };
    } catch (error: any) {
      console.error('Firebase initialization error:', error);
      setError(error.message);
      setIsConnected(false);
    }
  }, [messageHandler]);

  // Create a socket-like interface
  const socket = {
    readyState: isConnected ? 1 : 3,
    addEventListener: () => {}, // Dummy method
    removeEventListener: () => {}, // Dummy method
    send: (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'updateStatus' && data.room && data.status) {
          const roomRef = ref(database, `rooms/${data.room}`);
          set(roomRef, data.status)
            .then(() => console.log('Room status updated:', data.room, data.status))
            .catch((error) => {
              console.error('Error updating room status:', error);
              setError(error.message);
            });
        }
      } catch (error: any) {
        console.error('Message processing error:', error);
        setError(error.message);
      }
    },
    set onmessage(handler: ((event: { data: string }) => void) | null) {
      setMessageHandler((data: RoomStatuses) => {
        if (handler) {
          handler({
            data: JSON.stringify({
              type: 'initialStatus',
              data
            })
          });
        }
      });
    }
  };

  return {
    socket,
    isConnected,
    error
  };
}