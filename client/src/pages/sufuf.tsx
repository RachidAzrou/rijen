import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, User, House, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/lib/use-socket";
import { FaPray } from "react-icons/fa";
import { PiUsersThree } from "react-icons/pi";

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
};

// Main Component
export function SufufPage() {
  const { socket, isConnected } = useSocket();
  const [rooms, setRooms] = useState<Record<string, Room>>({
    'first-floor': { id: 'first-floor', title: 'Moskee +1', status: 'grey' },
    'beneden': { id: 'beneden', title: 'Moskee +0', status: 'grey' },
    'garage': { id: 'garage', title: 'Garage', status: 'grey' }
  });
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [okChecked, setOkChecked] = useState(false);
  const [nokChecked, setNokChecked] = useState(false);
  const [isVolunteerSectionOpen, setIsVolunteerSectionOpen] = useState(true);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === "initialStatus") {
        const updatedRooms = { ...rooms };
        Object.entries(data.data).forEach(([key, value]: [string, any]) => {
          if (updatedRooms[key]) {
            updatedRooms[key].status = value.status;
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

  useEffect(() => {
    if (!socket || !selectedRoom) return;

    // Reset toggles when room changes
    setOkChecked(rooms[selectedRoom].status === 'green');
    setNokChecked(rooms[selectedRoom].status === 'red');
  }, [selectedRoom, rooms]);

  const handleStatusUpdate = (room: string, status: "OK" | "NOK" | "RESET") => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "updateStatus", room, status }));
    }
  };

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
                    'bg-[#D9A347]'
                  }
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

      {/* Vrijwilligers Sectie - Now Collapsible */}
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
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(rooms).map((room) => (
              <Card
                key={room.id}
                className={`
                  overflow-hidden bg-white hover:shadow-lg transition-all duration-300 cursor-pointer
                  ${selectedRoom === room.id ? 'ring-2 ring-[#963E56] ring-offset-2' : ''}
                `}
                onClick={() => setSelectedRoom(room.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <House className="h-5 w-5 text-[#963E56]" />
                      <span className="font-medium text-[#963E56]">{room.title}</span>
                    </div>
                  </div>
                  {selectedRoom === room.id && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          onClick={() => handleStatusUpdate(room.id, "OK")}
                          className="bg-[#6BB85C] hover:bg-[#6BB85C]/90"
                        >
                          OK
                        </Button>
                        <Button
                          onClick={() => handleStatusUpdate(room.id, "NOK")}
                          className="bg-[#963E56] hover:bg-[#963E56]/90"
                        >
                          NOK
                        </Button>
                        <Button
                          onClick={() => handleStatusUpdate(room.id, "RESET")}
                          className="bg-[#D9A347] hover:bg-[#D9A347]/90"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}