import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, LayoutDashboard } from "lucide-react";
import { useSocket } from "@/lib/use-socket";
import { FaPray } from "react-icons/fa";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { useLocation } from "wouter";

const ROOM_STATUSES_KEY = 'room_statuses';
const VALID_ROOM_IDS = ['prayer-ground', 'prayer-first', 'garage'] as const;
type RoomId = typeof VALID_ROOM_IDS[number];

const rooms = {
  'prayer-ground': { id: 'prayer-ground' as RoomId, title: 'Gebedsruimte +0', status: 'grey' },
  'prayer-first': { id: 'prayer-first' as RoomId, title: 'Gebedsruimte +1', status: 'grey' },
  'garage': { id: 'garage' as RoomId, title: 'Garage', status: 'grey' }
} as const;

export default function ImamDashboard() {
  const { socket, isConnected, sendMessage } = useSocket();
  const [_, setLocation] = useLocation();

  const [roomStatuses, setRoomStatuses] = useState<Record<RoomId, 'green' | 'red' | 'grey'>>(() => {
    try {
      const stored = localStorage.getItem(ROOM_STATUSES_KEY);
      const defaultStatuses = Object.keys(rooms).reduce((acc, key) => ({ 
        ...acc, 
        [key]: 'grey' 
      }), {} as Record<RoomId, 'green' | 'red' | 'grey'>);

      if (stored) {
        const parsedStatuses = JSON.parse(stored);
        const validStatuses = VALID_ROOM_IDS.reduce((acc, roomId) => ({
          ...acc,
          [roomId]: parsedStatuses[roomId] || 'grey'
        }), {} as Record<RoomId, 'green' | 'red' | 'grey'>);
        return validStatuses;
      }
      return defaultStatuses;
    } catch (error) {
      console.error('[Firebase] Error loading stored statuses:', error);
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
    if (!socket || !isConnected) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "initialStatus") {
          const newStatuses = { ...roomStatuses };
          Object.entries(data.data).forEach(([room, status]: [string, any]) => {
            if (VALID_ROOM_IDS.includes(room as RoomId)) {
              newStatuses[room as RoomId] = status === 'OK' ? 'green' : status === 'NOK' ? 'red' : 'grey';
            }
          });
          setRoomStatuses(newStatuses);
          localStorage.setItem(ROOM_STATUSES_KEY, JSON.stringify(newStatuses));
        } else if (data.type === "statusUpdated") {
          if (VALID_ROOM_IDS.includes(data.room as RoomId)) {
            setRoomStatuses(prev => {
              const newStatuses = {
                ...prev,
                [data.room as RoomId]: data.status === 'OK' ? 'green' : data.status === 'NOK' ? 'red' : 'grey'
              };
              localStorage.setItem(ROOM_STATUSES_KEY, JSON.stringify(newStatuses));
              return newStatuses;
            });
          }
        }
      } catch (error) {
        console.error('[WebSocket] Error handling message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);
    sendMessage(JSON.stringify({ type: "getInitialStatus" }));

    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, isConnected, sendMessage]);

  return (
    <div className="fixed inset-0 touch-none bg-gray-50/50">
      <div className="absolute inset-0 flex flex-col">
        {/* Header - Fixed Height */}
        <div className="flex-none px-3 md:px-4 pt-4">
          <div className="rounded-lg md:rounded-xl p-3 md:p-4 bg-white border border-[#963E56]/10">
            <div className="flex items-center gap-3">
              <div className="bg-[#963E56]/10 p-2 md:p-3 rounded-full">
                <LayoutDashboard className="h-6 w-6 md:h-7 md:w-7 text-[#963E56]" />
              </div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#963E56]">
                Imam Dashboard
              </h1>
            </div>
          </div>
        </div>

        {/* Content - Fill Remaining Space */}
        <div className="flex-1 px-3 md:px-4 py-4 grid grid-rows-[auto_1fr_auto] gap-2">
          {/* Status Cards */}
          <Card className="bg-white/80 backdrop-blur-sm border-[#963E56]/10">
            <CardContent className="p-3 md:p-4">
              <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {Object.values(rooms).map((room) => (
                  <div
                    key={room.id}
                    className="bg-white/90 backdrop-blur-sm rounded-lg border border-[#963E56]/10 p-3 md:p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="bg-[#963E56]/10 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center">
                          <FaPray className="w-4 h-4 md:w-5 md:h-5 text-[#963E56]" />
                        </div>
                        <span className="text-base md:text-lg font-semibold text-[#963E56]">
                          {room.title}
                        </span>
                      </div>
                      <div className={`
                        relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500
                        ${roomStatuses[room.id] === 'green'
                          ? 'bg-[#6BB85C] shadow-lg shadow-[#6BB85C]/50'
                          : roomStatuses[room.id] === 'red'
                            ? 'bg-red-500 shadow-lg shadow-red-500/50'
                            : 'bg-gray-300'
                        }
                      `}>
                        {roomStatuses[room.id] === 'green' && <Check className="w-6 h-6 md:w-7 md:h-7 text-white" />}
                        {roomStatuses[room.id] === 'red' && <X className="w-6 h-6 md:w-7 md:h-7 text-white" />}
                      </div>
                    </div>
                    <div className="mt-3 h-2 md:h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          roomStatuses[room.id] === 'green' ? 'w-full bg-[#6BB85C]' :
                            roomStatuses[room.id] === 'red' ? 'w-full bg-red-500' :
                              'w-0'
                        }`}
                      />
                    </div>

                    {/* Status Text */}
                    <p className={`text-center mt-4 font-medium ${
                      roomStatuses[room.id] === 'green'
                        ? 'text-[#6BB85C]'
                        : roomStatuses[room.id] === 'red'
                          ? 'text-red-500'
                          : 'text-gray-400'
                    }`}>
                      {roomStatuses[room.id] === 'green'
                        ? 'Rijen zijn in orde'
                        : roomStatuses[room.id] === 'red'
                          ? 'Rijen zijn niet in orde'
                          : '—'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}