import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/lib/use-socket";
import { FaPray } from "react-icons/fa";
import { auth } from "@/lib/firebase";
import { useLocation, useRoute } from "wouter";

const VALID_ROOM_IDS = ['prayer-first', 'prayer-ground', 'garage'] as const;
type RoomId = typeof VALID_ROOM_IDS[number];

const ROOM_STATUSES_KEY = 'sufuf_room_statuses';

type ServerStatus = 'OK' | 'NOK' | 'OFF';
type DisplayStatus = 'green' | 'red' | 'grey';

interface RoomStatuses {
  [key: string]: DisplayStatus;
}

const rooms = {
  'prayer-first': { id: 'prayer-first', title: 'Gebedsruimte +1', status: 'grey' },
  'prayer-ground': { id: 'prayer-ground', title: 'Gebedsruimte +0', status: 'grey' },
  'garage': { id: 'garage', title: 'Garage', status: 'grey' }
} as const;

function convertServerToDisplayStatus(status: ServerStatus): DisplayStatus {
  switch (status) {
    case 'OK': return 'green';
    case 'NOK': return 'red';
    case 'OFF': return 'grey';
  }
}

export function SufufPage() {
  const { socket, isConnected, sendMessage } = useSocket();
  const [_, setLocation] = useLocation();
  const [match, params] = useRoute('/dashboard/:roomId');
  const roomId = params?.roomId as RoomId;
  const currentRoom = rooms[roomId];

  // Load initial statuses from sessionStorage
  const [roomStatuses, setRoomStatuses] = useState<RoomStatuses>(() => {
    try {
      const stored = sessionStorage.getItem(ROOM_STATUSES_KEY);
      console.log('[Session] Loading stored statuses:', stored);

      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'object' && parsed !== null) {
          // Validate each room status
          const validStatuses = Object.entries(parsed).reduce((acc, [room, status]) => {
            if (VALID_ROOM_IDS.includes(room as RoomId) && ['green', 'red', 'grey'].includes(status as DisplayStatus)) {
              acc[room] = status as DisplayStatus;
            } else {
              acc[room] = 'grey';
            }
            return acc;
          }, {} as RoomStatuses);

          console.log('[Session] Loaded valid statuses:', validStatuses);
          return validStatuses;
        }
      }
    } catch (error) {
      console.error('[Session] Error loading statuses:', error);
    }

    // Default statuses if storage is empty or invalid
    const defaultStatuses = VALID_ROOM_IDS.reduce((acc, id) => ({ ...acc, [id]: 'grey' }), {} as RoomStatuses);
    console.log('[Session] Using default statuses:', defaultStatuses);
    return defaultStatuses;
  });

  // Save status changes to sessionStorage
  useEffect(() => {
    try {
      console.log('[Session] Saving statuses:', roomStatuses);
      sessionStorage.setItem(ROOM_STATUSES_KEY, JSON.stringify(roomStatuses));
    } catch (error) {
      console.error('[Session] Error saving statuses:', error);
    }
  }, [roomStatuses]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WebSocket] Received:', data);

        if (data.type === 'statusUpdated') {
          setRoomStatuses(prev => {
            const newStatus = convertServerToDisplayStatus(data.status as ServerStatus);
            const newStatuses = { ...prev, [data.room]: newStatus };
            console.log('[WebSocket] Updating statuses:', newStatuses);
            return newStatuses;
          });
        } else if (data.type === 'initialStatus') {
          const newStatuses = Object.entries(data.data).reduce((acc, [room, status]) => ({
            ...acc,
            [room]: convertServerToDisplayStatus(status as ServerStatus)
          }), {} as RoomStatuses);
          console.log('[WebSocket] Setting initial statuses:', newStatuses);
          setRoomStatuses(newStatuses);
        }
      } catch (error) {
        console.error('[WebSocket] Error handling message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);

    // Request initial status
    console.log('[WebSocket] Requesting initial status');
    sendMessage(JSON.stringify({ type: 'getInitialStatus' }));

    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, sendMessage]);

  // Handle authentication and cleanup
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        console.log('[Auth] User logged out, clearing session');
        sessionStorage.removeItem(ROOM_STATUSES_KEY);
        setRoomStatuses(VALID_ROOM_IDS.reduce((acc, id) => ({ ...acc, [id]: 'grey' }), {} as RoomStatuses));

        if (socket && isConnected) {
          VALID_ROOM_IDS.forEach(room => {
            sendMessage(JSON.stringify({
              type: 'updateStatus',
              room,
              status: 'OFF'
            }));
          });
        }

        setLocation("/login");
      }
    });
    return () => unsubscribe();
  }, [socket, isConnected, sendMessage, setLocation]);

  // Handle status updates
  const handleStatusUpdate = (newStatus: ServerStatus) => {
    if (!isConnected) {
      console.warn('[WebSocket] Cannot update - not connected');
      return;
    }

    console.log(`[WebSocket] Sending status update for ${roomId}: ${newStatus}`);
    sendMessage(JSON.stringify({
      type: 'updateStatus',
      room: roomId,
      status: newStatus
    }));
  };

  return (
    <div className="min-h-screen w-full pb-16 md:pb-0">
      <div className="container mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-[#963E56]/10">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-[#963E56]/10 p-2 md:p-3 rounded-full">
              <FaPray className="h-6 w-6 md:h-8 md:w-8 text-[#963E56]" />
            </div>
            <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-[#963E56]">
              Dashboard {currentRoom?.title}
            </h1>
          </div>
        </div>

        {/* Status Section */}
        <div className="space-y-4">
          {/* Ruimtes Sectie Titel */}
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 text-lg md:text-xl font-semibold text-[#963E56] hover:bg-[#963E56]/5 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-[#963E56]/10"
          >
            <div className="flex items-center gap-3">
              <User className="h-6 w-6" />
              <span>Status Gebedsruimtes</span>
            </div>
            <ChevronDown className="h-5 w-5" />
          </Button>

          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(rooms).map((room) => (
              <Card
                key={room.id}
                className="group bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border border-[#963E56]/10"
              >
                <CardHeader className="p-4 md:p-6 pb-2 md:pb-4 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="flex items-center gap-3 text-base md:text-lg font-semibold text-[#963E56]">
                    <FaPray className="h-5 w-5" />
                    {room.title}
                  </CardTitle>
                  <div className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                    ${roomStatuses[room.id] === 'green'
                      ? 'bg-[#6BB85C] shadow-lg shadow-[#6BB85C]/50 group-hover:scale-110'
                      : roomStatuses[room.id] === 'red'
                        ? 'bg-red-500 shadow-lg shadow-red-500/50 group-hover:scale-110'
                        : 'bg-gray-300 group-hover:bg-gray-400'}
                  `}>
                    {roomStatuses[room.id] === 'green' && <Check className="w-6 h-6 text-white" />}
                    {roomStatuses[room.id] === 'red' && <X className="w-6 h-6 text-white" />}
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-2">
                  <div className="mt-2 md:mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
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

        {/* Vrijwilligersacties sectie */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 text-lg md:text-xl font-semibold text-[#963E56] hover:bg-[#963E56]/5 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-[#963E56]/10"
            onClick={() => setIsVolunteerSectionOpen(!isVolunteerSectionOpen)}
          >
            <div className="flex items-center gap-3">
              <User className="h-6 w-6" />
              <span>Vrijwilliger Acties</span>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isVolunteerSectionOpen ? 'transform rotate-180' : ''}`} />
          </Button>

          {isVolunteerSectionOpen && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleStatusUpdate(roomStatuses[roomId] !== 'green' ? "OK" : "OFF")}
                className={`
                  relative h-24 md:h-28 rounded-xl transition-all duration-300
                  hover:shadow-lg active:scale-[0.98] touch-manipulation
                  bg-white/80 backdrop-blur-sm border-2
                  ${roomStatuses[roomId] === 'green'
                    ? 'border-[#6BB85C] shadow-md'
                    : 'border-gray-200 hover:border-[#6BB85C]'
                  }
                `}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`
                    w-16 h-16 md:w-20 md:h-20 rounded-2xl transition-all duration-300 flex items-center justify-center
                    ${roomStatuses[roomId] === 'green'
                      ? 'bg-[#6BB85C]'
                      : 'bg-[#6BB85C]/10 hover:bg-[#6BB85C]/20'
                    }
                  `}>
                    <Check className={`
                      w-8 h-8 md:w-10 md:h-10 stroke-[2.5] transition-all duration-300
                      ${roomStatuses[roomId] === 'green' ? 'text-white scale-110' : 'text-[#6BB85C]'}
                    `} />
                  </div>
                </div>
                {roomStatuses[roomId] === 'green' && (
                  <div className="absolute top-2 md:top-3 right-2 md:right-3">
                    <div className="h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-[#6BB85C] ring-4 ring-[#6BB85C]/20 shadow-[0_0_10px_rgba(107,184,92,0.5)]" />
                  </div>
                )}
              </button>

              <button
                onClick={() => handleStatusUpdate(roomStatuses[roomId] !== 'red' ? "NOK" : "OFF")}
                className={`
                  relative h-24 md:h-28 rounded-xl transition-all duration-300
                  hover:shadow-lg active:scale-[0.98] touch-manipulation
                  bg-white/80 backdrop-blur-sm border-2
                  ${roomStatuses[roomId] === 'red'
                    ? 'border-red-500 shadow-md'
                    : 'border-gray-200 hover:border-red-500'
                  }
                `}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`
                    w-16 h-16 md:w-20 md:h-20 rounded-2xl transition-all duration-300 flex items-center justify-center
                    ${roomStatuses[roomId] === 'red'
                      ? 'bg-red-500'
                      : 'bg-red-500/10 hover:bg-red-500/20'
                    }
                  `}>
                    <X className={`
                      w-8 h-8 md:w-10 md:h-10 stroke-[2.5] transition-all duration-300
                      ${roomStatuses[roomId] === 'red' ? 'text-white scale-110' : 'text-red-500'}
                    `} />
                  </div>
                </div>
                {roomStatuses[roomId] === 'red' && (
                  <div className="absolute top-2 md:top-3 right-2 md:right-3">
                    <div className="h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-red-500 ring-4 ring-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}