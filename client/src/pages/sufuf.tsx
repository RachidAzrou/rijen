import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, User, House, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/lib/use-socket";
import { FaPray } from "react-icons/fa";
import { PiUsersThree } from "react-icons/pi";
import { auth } from "@/lib/firebase";
import { useLocation } from "wouter";

// Hadieth Component - Smaller version
const HadiethCard = () => (
  <Card className="bg-gradient-to-br from-[#963E56]/5 to-transparent border border-[#963E56]/10">
    <CardContent className="p-4">
      <blockquote className="space-y-2">
        <p className="text-base text-[#963E56] leading-relaxed font-medium italic">
          "Houd de rijen recht, want het recht houden van de rijen is deel van het perfect verrichten van het gebed."
        </p>
        <footer className="text-xs text-[#963E56]/80">
          — Overgeleverd door Bukhari & Muslim
        </footer>
      </blockquote>
    </CardContent>
  </Card>
);

// Room type definitie
type Room = {
  id: string;
  title: string;
  status: 'green' | 'red' | 'grey';
  email?: string;
};

// Main Component
export function SufufPage() {
  const { socket, isConnected } = useSocket();
  const [_, setLocation] = useLocation();
  const [rooms, setRooms] = useState<Record<string, Room>>({
    'first-floor': { id: 'first-floor', title: 'Moskee +1', status: 'grey', email: 'boven@mefen.be' },
    'beneden': { id: 'beneden', title: 'Moskee +0', status: 'grey', email: 'beneden@mefen.be' },
    'garage': { id: 'garage', title: 'Garage', status: 'grey', email: 'garage@mefen.be' }
  });
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isVolunteerSectionOpen, setIsVolunteerSectionOpen] = useState(true);

  useEffect(() => {
    // Check authentication status
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
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === "initialStatus") {
        const updatedRooms = { ...rooms };
        Object.entries(data.data).forEach(([key, value]: [string, any]) => {
          if (updatedRooms[key]) {
            updatedRooms[key].status = value as 'green' | 'red' | 'grey';
          }
        });
        setRooms(updatedRooms);
      } else if (data.type === "statusUpdated") {
        setRooms(prev => ({
          ...prev,
          [data.data.room]: { ...prev[data.data.room], status: data.data.status }
        }));
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket]);

  const handleOkChange = (room: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      // If already green, set to grey, otherwise set to green and turn off red
      socket.send(JSON.stringify({ 
        type: "updateStatus", 
        room, 
        status: rooms[room].status === 'green' ? 'grey' : 'green'
      }));

      // Update local state immediately
      setRooms(prev => ({
        ...prev,
        [room]: { 
          ...prev[room], 
          status: prev[room].status === 'green' ? 'grey' : 'green'
        }
      }));
    }
  };

  const handleNokChange = (room: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      // If already red, set to grey, otherwise set to red and turn off green
      socket.send(JSON.stringify({ 
        type: "updateStatus", 
        room, 
        status: rooms[room].status === 'red' ? 'grey' : 'red'
      }));

      // Update local state immediately
      setRooms(prev => ({
        ...prev,
        [room]: { 
          ...prev[room], 
          status: prev[room].status === 'red' ? 'grey' : 'red'
        }
      }));
    }
  };

  // Filter rooms for volunteer dashboard based on user email
  const volunteerRooms = Object.values(rooms).filter(room => 
    currentUserEmail === room.email
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <PiUsersThree className="h-8 w-8 text-[#963E56]" />
        <h1 className="text-2xl md:text-3xl font-bold text-[#963E56]">
          Sufuf (Gebedsrijen)
        </h1>
      </div>

      <HadiethCard />

      {/* Imam Dashboard */}
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
                  ${room.status === 'green' ? 'bg-[#6BB85C] animate-pulse shadow-lg shadow-[#6BB85C]/50' :
                    room.status === 'red' ? 'bg-[#963E56] animate-pulse shadow-lg shadow-[#963E56]/50' :
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
                      room.status === 'red' ? 'w-full bg-[#963E56]' :
                      'w-0'
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Vrijwilligers Sectie */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between p-2 text-xl font-semibold text-[#963E56] hover:bg-[#963E56]/5"
          onClick={() => setIsVolunteerSectionOpen(!isVolunteerSectionOpen)}
        >
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span>Vrijwilliger Dashboard</span>
          </div>
          <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isVolunteerSectionOpen ? 'transform rotate-180' : ''}`} />
        </Button>

        {isVolunteerSectionOpen && (
          <div className="grid gap-4 grid-cols-1">
            {volunteerRooms.map((room) => (
              <Card
                key={room.id}
                className="overflow-hidden bg-white hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <House className="h-5 w-5 text-[#963E56]" />
                      <span className="font-medium text-[#963E56]">{room.title}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Check className={`w-5 h-5 ${room.status === 'green' ? 'text-[#6BB85C]' : 'text-gray-300'}`} />
                      <span className="font-medium text-[#963E56]">OK</span>
                    </div>
                    <label className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        className="opacity-0 w-0 h-0"
                        checked={room.status === 'green'}
                        onChange={() => handleOkChange(room.id)}
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
                  <div className="mt-4 flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                      <X className={`w-5 h-5 ${room.status === 'red' ? 'text-[#963E56]' : 'text-gray-300'}`} />
                      <span className="font-medium text-[#963E56]">NOK</span>
                    </div>
                    <label className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        className="opacity-0 w-0 h-0"
                        checked={room.status === 'red'}
                        onChange={() => handleNokChange(room.id)}
                      />
                      <span className={`
                        absolute cursor-pointer inset-0 rounded-full transition-all duration-300
                        ${room.status === 'red' ? 'bg-[#963E56]' : 'bg-gray-200'}
                      `} />
                      <span className={`
                        absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300
                        ${room.status === 'red' ? 'transform translate-x-6' : ''}
                      `} />
                    </label>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}