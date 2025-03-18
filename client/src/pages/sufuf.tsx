import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, User, ChevronDown, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaPray } from "react-icons/fa";
import { auth, database } from "@/lib/firebase";
import { useLocation, useRoute } from "wouter";
import { useRoomStatus } from "@/lib/use-room-status";
import { ref, set } from "firebase/database";

const VALID_ROOM_IDS = ['prayer-ground', 'prayer-first', 'garage'] as const;
type RoomId = typeof VALID_ROOM_IDS[number];

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
      await updateStatus(roomId, newStatus);
    } catch (error) {
      console.error('[Firebase] Error updating status:', error);
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-gray-50/50">
      <div className="absolute inset-0 flex flex-col">
        <div className="w-full max-h-full px-3 md:px-4 py-4 md:py-6">
          <div className="flex flex-col h-full space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex-none rounded-lg md:rounded-xl p-3 md:p-4 bg-white border border-[#963E56]/10">
              <div className="flex items-center gap-3">
                <div className="bg-[#963E56]/10 p-2 md:p-3 rounded-full">
                  <LayoutDashboard className="h-6 w-6 md:h-7 md:w-7 text-[#963E56]" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#963E56]">
                    {currentRoom?.title}
                  </h1>
                  <p className="text-sm md:text-base text-[#963E56]/70">
                    Status en beheer
                  </p>
                </div>
              </div>
            </div>

            {/* Status Cards Container - Now transparent */}
            <Card className="flex-none bg-white/80 backdrop-blur-sm border-[#963E56]/10">
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vrijwilligersacties sectie */}
            <div className="flex-none space-y-4 md:space-y-6">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-3 md:p-4 text-lg md:text-xl font-semibold text-[#963E56] hover:bg-[#963E56]/5 rounded-lg md:rounded-xl bg-white shadow-sm border border-[#963E56]/10"
                onClick={() => setIsVolunteerSectionOpen(!isVolunteerSectionOpen)}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <User className="h-5 w-5 md:h-6 md:w-6" />
                  <span>Vrijwilliger Acties</span>
                </div>
                <ChevronDown className={`h-5 w-5 md:h-6 md:w-6 transition-transform duration-200 ${isVolunteerSectionOpen ? 'transform rotate-180' : ''}`} />
              </Button>

              {isVolunteerSectionOpen && (
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {/* OK Button */}
                  <button
                    onClick={() => handleStatusUpdate(roomStatuses[roomId] !== 'green' ? "OK" : "OFF")}
                    className={`
                      relative h-24 md:h-28 rounded-xl transition-all duration-300 
                      hover:shadow-xl active:scale-[0.98] touch-manipulation
                      border-[1.5px] bg-white overflow-hidden group
                      ${roomStatuses[roomId] === 'green'
                        ? 'border-[#6BB85C] shadow-lg hover:shadow-[#6BB85C]/20'
                        : 'border-[#963E56]/20 hover:border-[#6BB85C]/60'
                      }
                    `}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`
                        w-16 h-16 md:w-20 md:h-20 rounded-2xl transition-all duration-300 
                        flex items-center justify-center
                        transform group-hover:scale-105
                        ${roomStatuses[roomId] === 'green'
                          ? 'bg-[#6BB85C]'
                          : 'bg-white border-2 border-[#6BB85C]/20 hover:border-[#6BB85C]/40'
                        }
                      `}>
                        <Check className={`
                          w-10 h-10 md:w-12 md:h-12 stroke-[2.5] transition-all duration-300
                          ${roomStatuses[roomId] === 'green'
                            ? 'text-white'
                            : 'text-[#963E56] group-hover:text-[#6BB85C]'
                          }
                        `} />
                      </div>
                    </div>
                    {roomStatuses[roomId] === 'green' && (
                      <div className="absolute top-2 right-2 md:top-3 md:right-3">
                        <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-[#6BB85C] 
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
                      relative h-24 md:h-28 rounded-xl transition-all duration-300
                      hover:shadow-xl active:scale-[0.98] touch-manipulation
                      border-[1.5px] bg-white overflow-hidden group
                      ${roomStatuses[roomId] === 'red'
                        ? 'border-red-500 shadow-lg hover:shadow-red-500/20'
                        : 'border-[#963E56]/20 hover:border-red-500/60'
                      }
                    `}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`
                        w-16 h-16 md:w-20 md:h-20 rounded-2xl transition-all duration-300 
                        flex items-center justify-center
                        transform group-hover:scale-105
                        ${roomStatuses[roomId] === 'red'
                          ? 'bg-red-500'
                          : 'bg-white border-2 border-red-500/20 hover:border-red-500/40'
                        }
                      `}>
                        <X className={`
                          w-10 h-10 md:w-12 md:h-12 stroke-[2.5] transition-all duration-300
                          ${roomStatuses[roomId] === 'red'
                            ? 'text-white'
                            : 'text-[#963E56] group-hover:text-red-500'
                          }
                        `} />
                      </div>
                    </div>
                    {roomStatuses[roomId] === 'red' && (
                      <div className="absolute top-2 right-2 md:top-3 md:right-3">
                        <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-red-500 
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
      </div>
    </div>
  );
}