import { useEffect, useState } from 'react';
import { database } from './firebase';
import { ref, onValue, set, off } from 'firebase/database';

type RoomId = 'prayer-first' | 'prayer-ground' | 'garage';
type ServerStatus = 'OK' | 'NOK' | 'OFF';
type DisplayStatus = 'green' | 'red' | 'grey';

interface RoomStatuses {
  [key: string]: DisplayStatus;
}

const ROOM_STATUSES_KEY = 'sufuf_room_statuses';

function convertServerToDisplayStatus(status: ServerStatus): DisplayStatus {
  switch (status) {
    case 'OK': return 'green';
    case 'NOK': return 'red';
    case 'OFF': return 'grey';
  }
}

export function useRoomStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [roomStatuses, setRoomStatuses] = useState<RoomStatuses>(() => {
    try {
      const stored = localStorage.getItem(ROOM_STATUSES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('[Storage] Error loading statuses:', error);
    }
    return {};
  });

  useEffect(() => {
    const roomsRef = ref(database, 'rooms');
    
    onValue(roomsRef, (snapshot) => {
      setIsConnected(true);
      
      const data = snapshot.val();
      if (data) {
        setRoomStatuses(prev => {
          const newStatuses = { ...prev };
          Object.entries(data).forEach(([room, status]) => {
            // Only update if we don't have a local non-grey status
            if (!prev[room] || prev[room] === 'grey') {
              newStatuses[room] = convertServerToDisplayStatus(status as ServerStatus);
            }
          });
          return newStatuses;
        });
      }
    }, (error) => {
      console.error('[Firebase] Error:', error);
      setIsConnected(false);
    });

    return () => {
      off(roomsRef);
    };
  }, []);

  const updateStatus = async (roomId: RoomId, status: ServerStatus) => {
    if (!isConnected) {
      console.warn('[Firebase] Cannot update - not connected');
      return;
    }

    try {
      const displayStatus = convertServerToDisplayStatus(status);
      
      // Update local state first
      const newStatuses = {
        ...roomStatuses,
        [roomId]: displayStatus
      };
      
      // Save to localStorage
      localStorage.setItem(ROOM_STATUSES_KEY, JSON.stringify(newStatuses));
      setRoomStatuses(newStatuses);

      // Update Firebase
      await set(ref(database, `rooms/${roomId}`), status);
      
      console.log(`[Firebase] Updated ${roomId} status to ${status}`);
    } catch (error) {
      console.error('[Firebase] Error updating status:', error);
    }
  };

  return {
    isConnected,
    roomStatuses,
    updateStatus
  };
}
