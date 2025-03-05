import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/lib/use-socket";
import { FaPray } from "react-icons/fa";
import { PiMosqueDuotone, PiUsersThree } from "react-icons/pi";
import { auth } from "@/lib/firebase";
import { useLocation } from "wouter";

// Hadieth Component - Verkleinde versie
const HadiethCard = () => (
  <Card className="bg-gradient-to-br from-[#963E56]/5 to-transparent border-0 shadow-sm">
    <CardContent className="p-4">
      <blockquote className="space-y-2">
        <p className="text-sm text-[#963E56] leading-relaxed font-medium italic">
          "Houd de rijen recht, want het recht houden van de rijen is deel van het perfect verrichten van het gebed."
        </p>
        <footer className="text-xs text-[#963E56]/80">
          — Overgeleverd door Bukhari & Muslim
        </footer>
      </blockquote>
    </CardContent>
  </Card>
);

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
    console.log("Sufuf: WebSocket connected");
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log("Sufuf received message:", data);
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
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, isConnected]);

  const sendSocketMessage = (room: string, status: "OK" | "NOK" | "OFF") => {
    if (socket && isConnected && socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type: "updateStatus", room, status });
      console.log("Sending WebSocket message:", message);
      socket.send(message);
    }
  };

  const volunteerRooms = Object.values(rooms).filter(room =>
    currentUserEmail === room.email
  );

  return (
    <div 
      className="min-h-screen w-full"
      style={{
        background: `linear-gradient(135deg, rgba(245, 247, 250, 0.7), rgba(195, 207, 226, 0.7)), url('/static/123.jpg') center center/cover no-repeat fixed`
      }}
    >
      <div className="container mx-auto px-4 py-6 space-y-4 md:space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-[#963E56]/10">
          <div className="flex items-center gap-4">
            <div className="bg-[#963E56]/10 p-2 md:p-3 rounded-full">
              <FaPray className="h-6 w-6 md:h-8 md:w-8 text-[#963E56]" />
            </div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#963E56]">
              {currentUserEmail === 'beneden@mefen.be' ? 'Moskee +0' : 
               currentUserEmail === 'boven@mefen.be' ? 'Moskee +1' : 
               currentUserEmail === 'garage@mefen.be' ? 'Garage' : 'Dashboard'}
            </h1>
          </div>
        </div>

        <HadiethCard />

        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-[#963E56]/10">
            <PiMosqueDuotone className="h-6 w-6 text-[#963E56]" />
            <h2 className="text-xl font-semibold text-[#963E56]">
              Ruimtes
            </h2>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(rooms).map((room) => (
              <Card
                key={room.id}
                className="overflow-hidden bg-white hover:shadow-xl transition-all duration-300 border border-[#963E56]/10"
              >
                <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="flex items-center gap-3 text-lg font-semibold text-[#963E56]">
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
                <CardContent className="p-6 pt-2">
                  <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
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
        </div>

        <div className="space-y-4">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 text-xl font-semibold text-[#963E56] hover:bg-[#963E56]/5 bg-white rounded-lg shadow-sm border border-[#963E56]/10"
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
                <Card
                  key={room.id}
                  className="overflow-hidden bg-white hover:shadow-xl transition-all duration-300 border border-[#963E56]/10"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#963E56]/10 p-2 rounded-full">
                          <FaPray className="h-5 w-5 text-[#963E56]" />
                        </div>
                        <span className="font-medium text-[#963E56] text-lg">{room.title}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-[#963E56]/10">
                        <div className="flex items-center gap-3">
                          <Check className={`w-5 h-5 ${room.status === 'green' ? 'text-[#6BB85C]' : 'text-gray-300'}`} />
                          <span className="font-medium text-[#963E56]">OK</span>
                        </div>
                        <label className="relative inline-block w-12 h-6">
                          <input
                            type="checkbox"
                            className="opacity-0 w-0 h-0"
                            checked={room.status === 'green'}
                            onChange={(e) => {
                              if (e.target.checked) {
                                sendSocketMessage(room.id, "OK");
                              } else {
                                sendSocketMessage(room.id, "OFF");
                              }
                            }}
                          />
                          <span className={`
                            absolute cursor-pointer inset-0 rounded-full transition-all duration-300
                            ${room.status === 'green' ? 'bg-[#6BB85C]' : 'bg-gray-200'}
                          `} />
                          <span className={`
                            absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300
                            ${room.status === 'green' ? 'transform translate-x-6' : ''}
                          `} />
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-[#963E56]/10">
                        <div className="flex items-center gap-3">
                          <X className={`w-5 h-5 ${room.status === 'red' ? 'text-red-500' : 'text-gray-300'}`} />
                          <span className="font-medium text-[#963E56]">NOK</span>
                        </div>
                        <label className="relative inline-block w-12 h-6">
                          <input
                            type="checkbox"
                            className="opacity-0 w-0 h-0"
                            checked={room.status === 'red'}
                            onChange={(e) => {
                              if (e.target.checked) {
                                sendSocketMessage(room.id, "NOK");
                              } else {
                                sendSocketMessage(room.id, "OFF");
                              }
                            }}
                          />
                          <span className={`
                            absolute cursor-pointer inset-0 rounded-full transition-all duration-300
                            ${room.status === 'red' ? 'bg-red-500' : 'bg-gray-200'}
                          `} />
                          <span className={`
                            absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300
                            ${room.status === 'red' ? 'transform translate-x-6' : ''}
                          `} />
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}