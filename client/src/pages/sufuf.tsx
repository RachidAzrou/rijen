import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/lib/use-socket";
import { FaPray } from "react-icons/fa";
import { PiMosqueDuotone } from "react-icons/pi";
import { auth } from "@/lib/firebase";
import { useLocation } from "wouter";

// Room type definitie blijft hetzelfde
type Room = {
  id: string;
  title: string;
  status: 'green' | 'red' | 'grey';
  email?: string;
};

export function SufufPage() {
  const { socket, isConnected } = useSocket();
  const [_, setLocation] = useLocation();
  const [rooms, setRooms] = useState<Record<string, Room>>({
    'beneden': { id: 'beneden', title: 'Moskee +0', status: 'grey', email: 'beneden@mefen.be' },
    'first-floor': { id: 'first-floor', title: 'Moskee +1', status: 'grey', email: 'boven@mefen.be' },
    'garage': { id: 'garage', title: 'Garage', status: 'grey', email: 'garage@mefen.be' }
  });
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isVolunteerSectionOpen, setIsVolunteerSectionOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserEmail(user.email);
      } else {
        setLocation("/login");
      }
    });
    return () => unsubscribe();
  }, [setLocation]);

  useEffect(() => {
    if (!socket || !isConnected) return;
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === "initialStatus") {
        const updatedRooms = { ...rooms };
        Object.entries(data.data).forEach(([key, value]: [string, any]) => {
          if (updatedRooms[key]) {
            updatedRooms[key].status = value === 'OK' ? 'green' : value === 'NOK' ? 'red' : 'grey';
          }
        });
        setRooms(updatedRooms);
      } else if (data.type === "statusUpdated") {
        setRooms(prev => ({
          ...prev,
          [data.room]: {
            ...prev[data.room],
            status: data.status === 'OK' ? 'green' : data.status === 'NOK' ? 'red' : 'grey'
          }
        }));
      }
    };

    socket.addEventListener('message', handleMessage);
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "getInitialStatus" }));
    }
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, isConnected]);

  const sendSocketMessage = (room: string, status: "OK" | "NOK" | "OFF") => {
    if (socket && isConnected && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "updateStatus", room, status }));
    }
  };

  const volunteerRooms = Object.values(rooms).filter(room =>
    currentUserEmail === room.email
  );

  return (
    <div className="min-h-screen w-full pb-16 md:pb-0">
      <div className="container mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-[#963E56]/10">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-[#963E56]/10 p-2 md:p-3 rounded-full">
              <FaPray className="h-6 w-6 md:h-8 md:w-8 text-[#963E56]" />
            </div>
            <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-[#963E56]">
              {currentUserEmail === 'beneden@mefen.be' ? 'Moskee +0' :
                currentUserEmail === 'boven@mefen.be' ? 'Moskee +1' :
                  currentUserEmail === 'garage@mefen.be' ? 'Garage' : 'Dashboard'}
            </h1>
          </div>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(rooms).map((room) => (
            <Card
              key={room.id}
              className="overflow-hidden bg-white hover:shadow-xl transition-all duration-300 border border-[#963E56]/10"
            >
              <CardHeader className="p-4 md:p-6 pb-2 md:pb-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-3 text-base md:text-lg font-semibold text-[#963E56]">
                  <FaPray className="h-5 w-5" />
                  {room.title}
                </CardTitle>
                <div className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                  ${room.status === 'green' ? 'bg-[#6BB85C] animate-pulse shadow-lg shadow-[#6BB85C]/50' :
                    room.status === 'red' ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' :
                      'bg-gray-300'}
                `}>
                  {room.status === 'green' && <Check className="w-6 h-6 text-white" />}
                  {room.status === 'red' && <X className="w-6 h-6 text-white" />}
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-2">
                <div className="mt-2 md:mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      room.status === 'green' ? 'w-full bg-[#6BB85C]' :
                        room.status === 'red' ? 'w-full bg-red-500' :
                          'w-0'
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 text-lg md:text-xl font-semibold text-[#963E56] hover:bg-[#963E56]/5 bg-white rounded-lg shadow-sm border border-[#963E56]/10"
            onClick={() => setIsVolunteerSectionOpen(!isVolunteerSectionOpen)}
          >
            <div className="flex items-center gap-3">
              <User className="h-6 w-6" />
              <span>Vrijwilliger Acties</span>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isVolunteerSectionOpen ? 'transform rotate-180' : ''}`} />
          </Button>

          {isVolunteerSectionOpen && (
            <div className="grid gap-6 grid-cols-1">
              {volunteerRooms.map((room) => (
                <div key={room.id} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        if (room.status !== 'green') {
                          sendSocketMessage(room.id, "OK");
                        } else {
                          sendSocketMessage(room.id, "OFF");
                        }
                      }}
                      className={`
                        relative h-32 md:h-40 rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-3
                        active:scale-95 touch-manipulation
                        ${room.status === 'green'
                          ? 'bg-[#6BB85C] hover:bg-[#6BB85C]/90 shadow-lg'
                          : 'bg-white hover:bg-[#6BB85C]/5 border-2 border-[#6BB85C]'
                        }
                      `}
                    >
                      <div className={`
                        w-12 h-12 md:w-16 md:h-16 rounded-full transition-all duration-300 flex items-center justify-center
                        ${room.status === 'green'
                          ? 'bg-white/20'
                          : 'bg-[#6BB85C]/10'
                        }
                      `}>
                        <Check className={`w-8 h-8 md:w-10 md:h-10 ${room.status === 'green' ? 'text-white' : 'text-[#6BB85C]'}`} />
                      </div>
                      <span className={`text-base md:text-lg font-medium text-center ${room.status === 'green' ? 'text-white' : 'text-[#6BB85C]'}`}>
                        Rijen<br />In Orde
                      </span>
                      {room.status === 'green' && (
                        <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-lg">
                          <div className="h-3 w-3 rounded-full bg-[#6BB85C] animate-pulse" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (room.status !== 'red') {
                          sendSocketMessage(room.id, "NOK");
                        } else {
                          sendSocketMessage(room.id, "OFF");
                        }
                      }}
                      className={`
                        relative h-32 md:h-40 rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-3
                        active:scale-95 touch-manipulation
                        ${room.status === 'red'
                          ? 'bg-red-500 hover:bg-red-500/90 shadow-lg'
                          : 'bg-white hover:bg-red-500/5 border-2 border-red-500'
                        }
                      `}
                    >
                      <div className={`
                        w-12 h-12 md:w-16 md:h-16 rounded-full transition-all duration-300 flex items-center justify-center
                        ${room.status === 'red'
                          ? 'bg-white/20'
                          : 'bg-red-500/10'
                        }
                      `}>
                        <X className={`w-8 h-8 md:w-10 md:h-10 ${room.status === 'red' ? 'text-white' : 'text-red-500'}`} />
                      </div>
                      <span className={`text-base md:text-lg font-medium text-center ${room.status === 'red' ? 'text-white' : 'text-red-500'}`}>
                        Rijen<br />Niet In Orde
                      </span>
                      {room.status === 'red' && (
                        <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-lg">
                          <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}