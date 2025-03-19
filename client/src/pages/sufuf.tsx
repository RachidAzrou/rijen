import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, User, ChevronDown, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaPray } from "react-icons/fa";
import { auth } from "@/lib/firebase";
import { useLocation, useRoute } from "wouter";
import { useRoomStatus } from "@/lib/use-room-status";

const VALID_ROOM_IDS = ['prayer-ground', 'prayer-first', 'garage'] as const;
type RoomId = typeof VALID_ROOM_IDS[number];

const rooms = {
  'prayer-ground': { id: 'prayer-ground' as RoomId, title: 'Gebedsruimte +0' },
  'prayer-first': { id: 'prayer-first' as RoomId, title: 'Gebedsruimte +1' },
  'garage': { id: 'garage' as RoomId, title: 'Garage' }
} as const;

export function SufufPage() {
  const [_, setLocation] = useLocation();
  const [match, params] = useRoute('/dashboard/:roomId');
  const roomId = params?.roomId as RoomId;
  const currentRoom = rooms[roomId];
  const [isVolunteerSectionOpen, setIsVolunteerSectionOpen] = useState(true);
  const { isConnected, roomStatuses, updateStatus } = useRoomStatus();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) setLocation("/login");
    });
    return () => unsubscribe();
  }, [setLocation]);

  const handleStatusUpdate = async (newStatus: 'OK' | 'NOK' | 'OFF') => {
    if (!isConnected) return;
    try {
      await updateStatus(roomId, newStatus);
    } catch (error) {
      console.error('[Firebase] Error updating status:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50/50">
      {/* Header */}
      <div className="flex-none px-4 pt-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#963E56]/10">
          <div className="flex items-center gap-3">
            <div className="bg-[#963E56]/10 p-2.5 rounded-full">
              <LayoutDashboard className="h-5 w-5 text-[#963E56]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#963E56]">
                {currentRoom?.title}
              </h1>
              <p className="text-sm text-[#963E56]/70">
                Status en beheer
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        {/* Status Cards */}
        <Card className="bg-white/80 backdrop-blur-sm border-[#963E56]/10">
          <CardContent className="p-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Object.values(rooms).map((room) => (
                <div
                  key={room.id}
                  className="bg-white/90 backdrop-blur-sm rounded-lg border border-[#963E56]/10 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#963E56]/10 w-8 h-8 rounded-full flex items-center justify-center">
                        <FaPray className="w-4 h-4 text-[#963E56]" />
                      </div>
                      <span className="text-sm font-semibold text-[#963E56]">
                        {room.title}
                      </span>
                    </div>
                    <div className={`
                      relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500
                      ${roomStatuses[room.id] === 'green'
                        ? 'bg-[#6BB85C] shadow-lg shadow-[#6BB85C]/50'
                        : roomStatuses[room.id] === 'red'
                          ? 'bg-red-500 shadow-lg shadow-red-500/50'
                          : 'bg-gray-300'
                      }
                    `}>
                      {roomStatuses[room.id] === 'green' && <Check className="w-5 h-5 text-white" />}
                      {roomStatuses[room.id] === 'red' && <X className="w-5 h-5 text-white" />}
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        roomStatuses[room.id] === 'green' ? 'w-full bg-[#6BB85C]' :
                          roomStatuses[room.id] === 'red' ? 'w-full bg-red-500' :
                            'w-0'
                      }`}
                    />
                  </div>
                  <p className={`text-center mt-2 text-xs font-medium ${
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

        {/* Action Buttons Section */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 text-base font-semibold text-[#963E56] hover:bg-[#963E56]/5 rounded-xl bg-white shadow-sm border border-[#963E56]/10"
            onClick={() => setIsVolunteerSectionOpen(!isVolunteerSectionOpen)}
          >
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span>Vrijwilliger Acties</span>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isVolunteerSectionOpen ? 'transform rotate-180' : ''}`} />
          </Button>

          {isVolunteerSectionOpen && (
            <div className="grid grid-cols-2 gap-4">
              {/* OK Button */}
              <button
                onClick={() => handleStatusUpdate(roomStatuses[roomId] !== 'green' ? "OK" : "OFF")}
                className={`
                  relative h-20 rounded-xl transition-all duration-300 
                  hover:shadow-xl active:scale-[0.98] touch-manipulation
                  border bg-white overflow-hidden group
                  ${roomStatuses[roomId] === 'green'
                    ? 'border-[#6BB85C] shadow-lg hover:shadow-[#6BB85C]/20'
                    : 'border-[#963E56]/20 hover:border-[#6BB85C]/60'
                  }
                `}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`
                    w-12 h-12 rounded-xl transition-all duration-300 
                    flex items-center justify-center
                    transform group-hover:scale-105
                    ${roomStatuses[roomId] === 'green'
                      ? 'bg-[#6BB85C]'
                      : 'bg-white border-2 border-[#6BB85C]/20 hover:border-[#6BB85C]/40'
                    }
                  `}>
                    <Check className={`
                      w-7 h-7 stroke-[2.5] transition-all duration-300
                      ${roomStatuses[roomId] === 'green'
                        ? 'text-white'
                        : 'text-[#963E56] group-hover:text-[#6BB85C]'
                      }
                    `} />
                  </div>
                </div>
                {roomStatuses[roomId] === 'green' && (
                  <div className="absolute top-2 right-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#6BB85C] 
                      ring-2 ring-[#6BB85C]/20 
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
                  relative h-20 rounded-xl transition-all duration-300
                  hover:shadow-xl active:scale-[0.98] touch-manipulation
                  border bg-white overflow-hidden group
                  ${roomStatuses[roomId] === 'red'
                    ? 'border-red-500 shadow-lg hover:shadow-red-500/20'
                    : 'border-[#963E56]/20 hover:border-red-500/60'
                  }
                `}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`
                    w-12 h-12 rounded-xl transition-all duration-300 
                    flex items-center justify-center
                    transform group-hover:scale-105
                    ${roomStatuses[roomId] === 'red'
                      ? 'bg-red-500'
                      : 'bg-white border-2 border-red-500/20 hover:border-red-500/40'
                    }
                  `}>
                    <X className={`
                      w-7 h-7 stroke-[2.5] transition-all duration-300
                      ${roomStatuses[roomId] === 'red'
                        ? 'text-white'
                        : 'text-[#963E56] group-hover:text-red-500'
                      }
                    `} />
                  </div>
                </div>
                {roomStatuses[roomId] === 'red' && (
                  <div className="absolute top-2 right-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 
                      ring-2 ring-red-500/20 
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