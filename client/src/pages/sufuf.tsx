import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/lib/use-socket";
import { FaPray } from "react-icons/fa";
import { auth } from "@/lib/firebase";
import { useLocation, useRoute } from "wouter";

const ROOM_STATUSES_KEY = 'room_statuses';

// Define valid room IDs
const VALID_ROOM_IDS = ['prayer-first', 'prayer-ground', 'garage'] as const;
type RoomId = typeof VALID_ROOM_IDS[number];

const rooms = {
  'prayer-first': { id: 'prayer-first', title: 'Gebedsruimte +1', status: 'grey' },
  'prayer-ground': { id: 'prayer-ground', title: 'Gebedsruimte +0', status: 'grey' },
  'garage': { id: 'garage', title: 'Garage', status: 'grey' }
} as const;

export function SufufPage() {
  const { socket, isConnected, sendMessage } = useSocket();
  const [_, setLocation] = useLocation();
  const [match, params] = useRoute('/dashboard/:roomId');
  const roomId = params?.roomId || '';
  const currentRoom = rooms[roomId as keyof typeof rooms];

  // Load initial statuses from localStorage or use default
  const [roomStatuses, setRoomStatuses] = useState<Record<RoomId, 'green' | 'red' | 'grey'>>(() => {
    try {
      const stored = localStorage.getItem(ROOM_STATUSES_KEY);
      console.log('[Sufuf] Loading stored statuses:', stored);
      const defaultStatuses = Object.keys(rooms).reduce((acc, key) => ({ 
        ...acc, 
        [key]: 'grey' 
      }), {} as Record<RoomId, 'green' | 'red' | 'grey'>);

      if (stored) {
        const parsedStatuses = JSON.parse(stored);
        console.log('[Sufuf] Parsed stored statuses:', parsedStatuses);
        // Ensure we only use valid room IDs
        const validStatuses = VALID_ROOM_IDS.reduce((acc, roomId) => ({
          ...acc,
          [roomId]: parsedStatuses[roomId] || 'grey'
        }), {} as Record<RoomId, 'green' | 'red' | 'grey'>);
        return validStatuses;
      }
      return defaultStatuses;
    } catch (error) {
      console.error('[Sufuf] Error loading stored statuses:', error);
      return Object.keys(rooms).reduce((acc, key) => ({ 
        ...acc, 
        [key]: 'grey' 
      }), {} as Record<RoomId, 'green' | 'red' | 'grey'>);
    }
  });

  const [isVolunteerSectionOpen, setIsVolunteerSectionOpen] = useState(true);

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
      console.log('[Sufuf] Socket not connected yet');
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[Sufuf] Received WebSocket message:', data);

        if (data.type === "initialStatus") {
          console.log('[Sufuf] Processing initial status:', data.data);
          const newStatuses = { ...roomStatuses };
          Object.entries(data.data).forEach(([room, status]: [string, any]) => {
            if (VALID_ROOM_IDS.includes(room as RoomId)) {
              console.log(`[Sufuf] Setting status for room ${room} to ${status}`);
              newStatuses[room as RoomId] = status === 'OK' ? 'green' : status === 'NOK' ? 'red' : 'grey';
            } else {
              console.warn(`[Sufuf] Received status for unknown room: ${room}`);
            }
          });
          console.log('[Sufuf] Final room statuses:', newStatuses);
          setRoomStatuses(newStatuses);
          localStorage.setItem(ROOM_STATUSES_KEY, JSON.stringify(newStatuses));
        } else if (data.type === "statusUpdated") {
          console.log(`[Sufuf] Processing status update for room ${data.room}: ${data.status}`);
          if (VALID_ROOM_IDS.includes(data.room as RoomId)) {
            setRoomStatuses(prev => {
              const newStatuses = {
                ...prev,
                [data.room]: data.status === 'OK' ? 'green' : data.status === 'NOK' ? 'red' : 'grey'
              };
              console.log('[Sufuf] Updated room statuses:', newStatuses);
              localStorage.setItem(ROOM_STATUSES_KEY, JSON.stringify(newStatuses));
              return newStatuses;
            });
          } else {
            console.warn(`[Sufuf] Received status update for unknown room: ${data.room}`);
          }
        }
      } catch (error) {
        console.error('[Sufuf] Error handling WebSocket message:', error);
      }
    };

    console.log('[Sufuf] Setting up WebSocket handler for rooms:', VALID_ROOM_IDS);
    socket.addEventListener('message', handleMessage);
    console.log('[Sufuf] Requesting initial status');
    sendMessage(JSON.stringify({ type: "getInitialStatus" }));

    return () => {
      console.log('[Sufuf] Cleaning up WebSocket handler');
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, isConnected, sendMessage]);

  const handleStatusUpdate = (status: "OK" | "NOK" | "OFF") => {
    if (!VALID_ROOM_IDS.includes(roomId as RoomId)) {
      console.error(`[Sufuf] Invalid room ID: ${roomId}`);
      return;
    }

    console.log(`[Sufuf] Updating status for room ${roomId} to ${status}`);

    try {
      const message = JSON.stringify({
        type: "updateStatus",
        room: roomId,
        status: status
      });

      console.log('[Sufuf] Sending message:', message);
      sendMessage(message);

      // Optimistic update
      setRoomStatuses(prev => {
        const newStatuses = {
          ...prev,
          [roomId]: status === "OK" ? "green" : status === "NOK" ? "red" : "grey"
        };
        localStorage.setItem(ROOM_STATUSES_KEY, JSON.stringify(newStatuses));
        return newStatuses;
      });
    } catch (error) {
      console.error('[Sufuf] Error sending status update:', error);
    }
  };

  return (
    <div className="min-h-screen w-full pb-16 md:pb-0 bg-gray-50/50">
      <div className="container mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 md:p-6 border border-[#963E56]/10">
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
            <div className="grid gap-4">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}