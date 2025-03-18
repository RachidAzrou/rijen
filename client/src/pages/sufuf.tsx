import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaPray } from "react-icons/fa";
import { auth, database } from "@/lib/firebase";
import { useLocation, useRoute } from "wouter";
import { useRoomStatus } from "@/lib/use-room-status";
import { ref, set } from "firebase/database";

// Reordered room IDs
const VALID_ROOM_IDS = ['prayer-ground', 'prayer-first', 'garage'] as const;
type RoomId = typeof VALID_ROOM_IDS[number];

// Reordered rooms object
const rooms = {
  'prayer-ground': { id: 'prayer-ground', title: 'Gebedsruimte +0', status: 'grey' },
  'prayer-first': { id: 'prayer-first', title: 'Gebedsruimte +1', status: 'grey' },
  'garage': { id: 'garage', title: 'Garage', status: 'grey' }
} as const;

export function SufufPage() {
  const [_, setLocation] = useLocation();
  const [match, params] = useRoute('/dashboard/:roomId');
  const roomId = params?.roomId as RoomId;
  const currentRoom = rooms[roomId];
  const [isVolunteerSectionOpen, setIsVolunteerSectionOpen] = useState(true);
  const { isConnected, roomStatuses, updateStatus } = useRoomStatus();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        try {
          console.log('[Firebase] Resetting all room statuses to OFF');
          for (const roomId of VALID_ROOM_IDS) {
            await set(ref(database, `rooms/${roomId}`), 'OFF');
          }
          console.log('[Firebase] Successfully reset all room statuses');
        } catch (error) {
          console.error('[Firebase] Error resetting room statuses:', error);
        }
        setLocation("/login");
      }
    });
    return () => unsubscribe();
  }, [setLocation]);

  const handleStatusUpdate = async (newStatus: 'OK' | 'NOK' | 'OFF') => {
    if (!isConnected) {
      console.warn('[Firebase] Cannot update - not connected');
      return;
    }

    try {
      console.log(`[Firebase] Updating status for ${roomId} to ${newStatus}`);
      const roomRef = ref(database, `rooms/${roomId}`);
      await set(roomRef, newStatus);
      console.log(`[Firebase] Successfully updated ${roomId} status to ${newStatus}`);
    } catch (error) {
      console.error('[Firebase] Error updating status:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <div className="container mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8 flex-grow">
        {/* Header */}
        <div className="rounded-xl p-6 bg-white border border-[#963E56]/10">
          <div className="flex items-center gap-4">
            <div className="bg-[#963E56]/10 p-3 rounded-full">
              <FaPray className="h-8 w-8 text-[#963E56]" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#963E56]">
                {currentRoom?.title}
              </h1>
              <p className="text-base text-[#963E56]/70">
                Status en beheer
              </p>
            </div>
          </div>
        </div>

        {/* Status Cards Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(rooms).map((room) => (
            <Card
              key={room.id}
              className="group bg-white hover:shadow-xl transition-all duration-300 border border-[#963E56]/10"
            >
              <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-[#963E56]">
                  <div className="bg-[#963E56]/10 w-8 h-8 rounded-full flex items-center justify-center">
                    <FaPray className="w-5 h-5 text-[#963E56]" />
                  </div>
                  {room.title}
                </CardTitle>
                <div className={`
                  relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
                  ${roomStatuses[room.id] === 'green'
                    ? 'bg-[#6BB85C] shadow-lg shadow-[#6BB85C]/50 group-hover:scale-110'
                    : roomStatuses[room.id] === 'red'
                      ? 'bg-red-500 shadow-lg shadow-red-500/50 group-hover:scale-110'
                      : 'bg-gray-300 group-hover:bg-gray-400'}
                `}>
                  {roomStatuses[room.id] === 'green' && <Check className="w-7 h-7 text-white" />}
                  {roomStatuses[room.id] === 'red' && <X className="w-7 h-7 text-white" />}
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <div className="mt-4 h-3 w-full bg-gray-100 rounded-full overflow-hidden">
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

        {/* Vrijwilligersacties sectie */}
        <div className="space-y-8">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-5 text-xl font-semibold text-[#963E56] hover:bg-[#963E56]/5 rounded-xl bg-white shadow-sm border border-[#963E56]/10"
            onClick={() => setIsVolunteerSectionOpen(!isVolunteerSectionOpen)}
          >
            <div className="flex items-center gap-3">
              <User className="h-6 w-6" />
              <span>Vrijwilliger Acties</span>
            </div>
            <ChevronDown className={`h-6 w-6 transition-transform duration-200 ${isVolunteerSectionOpen ? 'transform rotate-180' : ''}`} />
          </Button>

          {isVolunteerSectionOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {/* OK Button */}
              <button
                onClick={() => handleStatusUpdate(roomStatuses[roomId] !== 'green' ? "OK" : "OFF")}
                className={`
                  relative h-36 md:h-32 rounded-xl transition-all duration-300 
                  hover:shadow-xl active:scale-[0.98] touch-manipulation
                  border-2 bg-white overflow-hidden
                  ${roomStatuses[roomId] === 'green'
                    ? 'border-[#6BB85C] shadow-lg hover:shadow-[#6BB85C]/20'
                    : 'border-gray-200 hover:border-[#6BB85C]/60'
                  }
                `}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`
                    w-28 h-28 md:w-24 md:h-24 rounded-2xl transition-all duration-300 
                    flex items-center justify-center
                    transform hover:scale-105
                    ${roomStatuses[roomId] === 'green'
                      ? 'bg-[#6BB85C]'
                      : 'bg-white border-2 border-[#6BB85C]/20 hover:border-[#6BB85C]/40'
                    }
                  `}>
                    <Check className={`
                      w-14 h-14 md:w-12 md:h-12 stroke-[2.5] transition-all duration-300
                      ${roomStatuses[roomId] === 'green'
                        ? 'text-white'
                        : 'text-[#6BB85C]'
                      }
                    `} />
                  </div>
                </div>
                {roomStatuses[roomId] === 'green' && (
                  <div className="absolute top-3 right-3">
                    <div className="h-3 w-3 rounded-full bg-[#6BB85C] 
                      ring-4 ring-[#6BB85C]/20 
                      shadow-[0_0_10px_rgba(107,184,92,0.5)]
                      animate-pulse"
                    />
                  </div>
                )}
              </button>

              {/* NOK Button */}
              <button
                onClick={() => handleStatusUpdate(roomStatuses[roomId] !== 'red' ? "NOK" : "OFF")}
                className={`
                  relative h-36 md:h-32 rounded-xl transition-all duration-300
                  hover:shadow-xl active:scale-[0.98] touch-manipulation
                  border-2 bg-white overflow-hidden
                  ${roomStatuses[roomId] === 'red'
                    ? 'border-red-500 shadow-lg hover:shadow-red-500/20'
                    : 'border-gray-200 hover:border-red-500/60'
                  }
                `}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`
                    w-28 h-28 md:w-24 md:h-24 rounded-2xl transition-all duration-300 
                    flex items-center justify-center
                    transform hover:scale-105
                    ${roomStatuses[roomId] === 'red'
                      ? 'bg-red-500'
                      : 'bg-white border-2 border-red-500/20 hover:border-red-500/40'
                    }
                  `}>
                    <X className={`
                      w-14 h-14 md:w-12 md:h-12 stroke-[2.5] transition-all duration-300
                      ${roomStatuses[roomId] === 'red'
                        ? 'text-white'
                        : 'text-red-500'
                      }
                    `} />
                  </div>
                </div>
                {roomStatuses[roomId] === 'red' && (
                  <div className="absolute top-3 right-3">
                    <div className="h-3 w-3 rounded-full bg-red-500 
                      ring-4 ring-red-500/20 
                      shadow-[0_0_10px_rgba(239,68,68,0.5)]
                      animate-pulse"
                    />
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