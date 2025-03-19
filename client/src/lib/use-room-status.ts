import { useEffect, useState } from 'react';
import { database } from './firebase';
import { ref, onValue, set, off } from 'firebase/database';

type RoomId = 'prayer-first' | 'prayer-ground' | 'garage';
type ServerStatus = 'OK' | 'NOK' | 'OFF';
type DisplayStatus = 'green' | 'red' | 'grey';

interface RoomStatuses {
  [key: string]: DisplayStatus;
}

// Reset timeout after 10 minutes
const RESET_TIMEOUT = 10 * 60 * 1000;

function convertServerToDisplayStatus(status: ServerStatus): DisplayStatus {
  switch (status) {
    case 'OK': return 'green';
    case 'NOK': return 'red';
    default: return 'grey';
  }
}

export function useRoomStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [roomStatuses, setRoomStatuses] = useState<RoomStatuses>({});
  const [resetTimers, setResetTimers] = useState<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    const roomsRef = ref(database, 'rooms');
    setIsConnected(true);

    const handleStatusChange = (snapshot: any) => {
      try {
        const data = snapshot.val();
        if (data) {
          const newStatuses = Object.entries(data).reduce((acc, [room, status]) => ({
            ...acc,
            [room]: convertServerToDisplayStatus(status as ServerStatus)
          }), {} as RoomStatuses);

          console.log('[Firebase] Room status update:', newStatuses);
          setRoomStatuses(newStatuses);

          // Set reset timers for each active status
          Object.entries(newStatuses).forEach(([room, status]) => {
            if (status !== 'grey') {
              // Clear existing timer if any
              if (resetTimers[room]) {
                clearTimeout(resetTimers[room]);
              }

              // Set new timer
              const timer = setTimeout(() => {
                console.log(`[Timer] Resetting status for ${room} to grey`);
                set(ref(database, `rooms/${room}`), 'OFF');
              }, RESET_TIMEOUT);

              setResetTimers(prev => ({
                ...prev,
                [room]: timer
              }));
            }
          });
        } else {
          // If no data, set all rooms to grey
          const defaultStatuses = ['prayer-first', 'prayer-ground', 'garage'].reduce(
            (acc, room) => ({ ...acc, [room]: 'grey' as DisplayStatus }),
            {} as RoomStatuses
          );
          setRoomStatuses(defaultStatuses);
        }
      } catch (error) {
        console.error('[Firebase] Error processing status update:', error);
        setIsConnected(false);
      }
    };

    onValue(roomsRef, handleStatusChange, (error) => {
      console.error('[Firebase] Database error:', error);
      setIsConnected(false);
    });

    // Cleanup function
    return () => {
      off(roomsRef);
      setIsConnected(false);
      // Clear all existing timers
      Object.values(resetTimers).forEach(timer => clearTimeout(timer));
    };
  }, []);

  const updateStatus = async (roomId: RoomId, status: ServerStatus) => {
    if (!isConnected) {
      throw new Error('Not connected to Firebase');
    }

    try {
      await set(ref(database, `rooms/${roomId}`), status);
      console.log(`[Firebase] Successfully updated ${roomId} status to ${status}`);
    } catch (error) {
      console.error('[Firebase] Error updating status:', error);
      throw error;
    }
  };

  return {
    isConnected,
    roomStatuses,
    updateStatus
  };
}