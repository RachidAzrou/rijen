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

      // Listen for changes
      const unsubscribe = onValue(roomsRef, (snapshot) => {
        try {
          const data = snapshot.val() || {
            'beneden': 'OFF',
            'first-floor': 'OFF',
            'garage': 'OFF'
          };

          // Initialize if no data exists
          if (!snapshot.exists()) {
            set(roomsRef, data)
              .then(() => console.log('Initial room data set'))
              .catch(error => console.error('Error setting initial data:', error));
          }

          // Update connected state and notify subscribers
          setIsConnected(true);
          messageHandler?.(data);
        } catch (error: any) {
          console.error('Error handling Firebase data:', error);
          setError(error.message);
        }
      }, (error) => {
        console.error('Firebase onValue error:', error);
        setError(error.message);
        setIsConnected(false);
      });

      return () => {
        unsubscribe();
        setIsConnected(false);
      };
    } catch (error: any) {
      console.error('Error initializing Firebase:', error);
      setError(error.message);
      setIsConnected(false);
    }
  }, [messageHandler]);

  // Create a socket-like interface with all expected methods
  const socket = {
    readyState: isConnected ? 1 : 3,
    addEventListener: () => {}, // Dummy method to prevent errors
    removeEventListener: () => {}, // Dummy method to prevent errors
    send: (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'updateStatus') {
          const roomRef = ref(database, `rooms/${data.room}`);
          set(roomRef, data.status)
            .then(() => console.log('Status updated:', data.room, data.status))
            .catch(error => {
              console.error('Error updating status:', error);
              setError(error.message);
            });
        }
      } catch (error: any) {
        console.error('Error processing message:', error);
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