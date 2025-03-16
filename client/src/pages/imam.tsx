import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, House } from "lucide-react";
import { useSocket } from "@/lib/use-socket";
import { FaPray } from "react-icons/fa";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { useLocation } from "wouter";

const ROOM_STATUSES_KEY = 'room_statuses';

// Define valid room IDs
const VALID_ROOM_IDS = ['prayer-ground', 'prayer-first', 'garage'] as const;
type RoomId = typeof VALID_ROOM_IDS[number];

// Room type definition
const rooms = {
  'prayer-ground': { id: 'prayer-ground' as RoomId, title: 'Gebedsruimte +0', status: 'grey' },
  'prayer-first': { id: 'prayer-first' as RoomId, title: 'Gebedsruimte +1', status: 'grey' },
  'garage': { id: 'garage' as RoomId, title: 'Garage', status: 'grey' }
} as const;

export default function ImamDashboard() {
  const { socket, isConnected, sendMessage } = useSocket();
  const [_, setLocation] = useLocation();

  // Load initial statuses from localStorage or use default
  const [roomStatuses, setRoomStatuses] = useState<Record<RoomId, 'green' | 'red' | 'grey'>>(() => {
    try {
      const stored = localStorage.getItem(ROOM_STATUSES_KEY);
      console.log('[ImamDashboard] Loading stored statuses:', stored);
      const defaultStatuses = Object.keys(rooms).reduce((acc, key) => ({ 
        ...acc, 
        [key]: 'grey' 
      }), {} as Record<RoomId, 'green' | 'red' | 'grey'>);

      if (stored) {
        const parsedStatuses = JSON.parse(stored);
        console.log('[ImamDashboard] Parsed stored statuses:', parsedStatuses);
        // Ensure we only use valid room IDs
        const validStatuses = VALID_ROOM_IDS.reduce((acc, roomId) => ({
          ...acc,
          [roomId]: parsedStatuses[roomId] || 'grey'
        }), {} as Record<RoomId, 'green' | 'red' | 'grey'>);
        return validStatuses;
      }
      return defaultStatuses;
    } catch (error) {
      console.error('[ImamDashboard] Error loading stored statuses:', error);
      return Object.keys(rooms).reduce((acc, key) => ({ 
        ...acc, 
        [key]: 'grey' 
      }), {} as Record<RoomId, 'green' | 'red' | 'grey'>);
    }
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setLocation("/login");
      }
    });
    return () => unsubscribe();
  }, [setLocation]);

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('[ImamDashboard] Socket not connected yet');
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[ImamDashboard] Received WebSocket message:", data);

        if (data.type === "initialStatus") {
          console.log('[ImamDashboard] Processing initial status:', data.data);
          const newStatuses = { ...roomStatuses };
          Object.entries(data.data).forEach(([room, status]: [string, any]) => {
            if (VALID_ROOM_IDS.includes(room as RoomId)) {
              console.log(`[ImamDashboard] Setting status for room ${room} to ${status}`);
              newStatuses[room as RoomId] = status === 'OK' ? 'green' : status === 'NOK' ? 'red' : 'grey';
            } else {
              console.warn(`[ImamDashboard] Received status for unknown room: ${room}`);
            }
          });
          console.log('[ImamDashboard] Final room statuses:', newStatuses);
          setRoomStatuses(newStatuses);
          localStorage.setItem(ROOM_STATUSES_KEY, JSON.stringify(newStatuses));
        } else if (data.type === "statusUpdated") {
          console.log(`[ImamDashboard] Processing status update for room ${data.room}: ${data.status}`);
          if (VALID_ROOM_IDS.includes(data.room as RoomId)) {
            setRoomStatuses(prev => {
              const newStatuses = {
                ...prev,
                [data.room as RoomId]: data.status === 'OK' ? 'green' : data.status === 'NOK' ? 'red' : 'grey'
              };
              console.log('[ImamDashboard] Updated room statuses:', newStatuses);
              localStorage.setItem(ROOM_STATUSES_KEY, JSON.stringify(newStatuses));
              return newStatuses;
            });
          } else {
            console.warn(`[ImamDashboard] Received status update for unknown room: ${data.room}`);
          }
        }
      } catch (error) {
        console.error('[ImamDashboard] Error handling WebSocket message:', error);
      }
    };

    console.log('[ImamDashboard] Setting up WebSocket handler for rooms:', VALID_ROOM_IDS);
    socket.addEventListener('message', handleMessage);
    console.log('[ImamDashboard] Requesting initial status');
    sendMessage(JSON.stringify({ type: "getInitialStatus" }));

    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, isConnected, sendMessage]);

  return (
    <div className="min-h-screen w-full">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#963E56] flex items-center gap-2">
            <FaPray className="h-5 w-5" />
            Imam Dashboard
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(rooms).map((room) => (
              <Card
                key={room.id}
                className="overflow-hidden bg-white hover:shadow-lg transition-all duration-300"
              >
                <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="flex items-center gap-3 text-lg font-semibold text-[#963E56]">
                    <House className="h-5 w-5" />
                    {room.title}
                  </CardTitle>
                  <div className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                    ${roomStatuses[room.id] === 'green' ? 'bg-[#6BB85C] animate-pulse shadow-lg shadow-[#6BB85C]/50' :
                      roomStatuses[room.id] === 'red' ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' :
                      'bg-gray-300'}
                  `}>
                    {roomStatuses[room.id] === 'green' && <Check className="w-6 h-6 text-white" />}
                    {roomStatuses[room.id] === 'red' && <X className="w-6 h-6 text-white" />}
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        roomStatuses[room.id] === 'green' ? 'w-full bg-[#6BB85C]' :
                        roomStatuses[room.id] === 'red' ? 'w-full bg-red-500' :
                        'w-0'
                      }`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}