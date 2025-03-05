import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/lib/use-socket";
import { FaPray } from "react-icons/fa";
import { auth } from "@/lib/firebase";
import { useLocation } from "wouter";

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
    <div className="min-h-screen w-full">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-[#963E56]/10">
          <div className="flex items-center gap-4">
            <div className="bg-[#963E56]/10 p-3 rounded-full">
              <FaPray className="h-8 w-8 text-[#963E56]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#963E56]">
              {currentUserEmail === 'beneden@mefen.be' ? 'Moskee +0' :
                currentUserEmail === 'boven@mefen.be' ? 'Moskee +1' :
                  currentUserEmail === 'garage@mefen.be' ? 'Garage' : 'Dashboard'}
            </h1>
          </div>
        </div>

        {/* Status Controls */}
        <div className="grid gap-6 grid-cols-1">
          {volunteerRooms.map((room) => (
            <Card
              key={room.id}
              className="overflow-hidden bg-white hover:shadow-xl transition-all duration-300 border border-[#963E56]/10"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#963E56]/10 p-2 rounded-full">
                      <FaPray className="h-5 w-5 text-[#963E56]" />
                    </div>
                    <span className="font-medium text-[#963E56] text-lg">{room.title}</span>
                  </div>

                  {/* Status Indicator */}
                  <div className={`
                    flex items-center gap-2 px-4 py-2 rounded-full
                    ${room.status === 'green' ? 'bg-[#6BB85C]/10 text-[#6BB85C]' :
                      room.status === 'red' ? 'bg-red-500/10 text-red-500' :
                        'bg-gray-100 text-gray-500'}
                  `}>
                    <div className={`
                      h-2 w-2 rounded-full
                      ${room.status === 'green' ? 'bg-[#6BB85C] animate-pulse' :
                        room.status === 'red' ? 'bg-red-500 animate-pulse' :
                          'bg-gray-400'}
                    `} />
                    <span className="text-sm font-medium">
                      {room.status === 'green' ? 'Rijen Goed' :
                        room.status === 'red' ? 'Rijen Niet Goed' :
                          'Niet Actief'}
                    </span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className={`
                      p-6 relative transition-all duration-300 rounded-xl
                      ${room.status === 'green'
                        ? 'bg-[#6BB85C]/10 border-[#6BB85C] text-[#6BB85C] hover:bg-[#6BB85C]/20'
                        : 'border-[#6BB85C] text-[#6BB85C] hover:bg-[#6BB85C]/10'
                      }
                    `}
                    onClick={() => {
                      if (room.status !== 'green') {
                        sendSocketMessage(room.id, "OK");
                      } else {
                        sendSocketMessage(room.id, "OFF");
                      }
                    }}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <Check className="h-5 w-5" />
                      <span className="font-medium">Rijen Goed</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className={`
                      p-6 relative transition-all duration-300 rounded-xl
                      ${room.status === 'red'
                        ? 'bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20'
                        : 'border-red-500 text-red-500 hover:bg-red-500/10'
                      }
                    `}
                    onClick={() => {
                      if (room.status !== 'red') {
                        sendSocketMessage(room.id, "NOK");
                      } else {
                        sendSocketMessage(room.id, "OFF");
                      }
                    }}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <X className="h-5 w-5" />
                      <span className="font-medium">Rijen Niet Goed</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}