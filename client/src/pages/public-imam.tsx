import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, House } from "lucide-react";
import { useSocket } from "@/lib/use-socket";
import { FaPray } from "react-icons/fa";
import { useState, useEffect } from "react";

// Room type definition
type Room = {
  id: string;
  title: string;
  status: 'green' | 'red' | 'grey';
};

export default function PublicImamDashboard() {
  const { socket, isConnected } = useSocket();
  const [rooms, setRooms] = useState<Record<string, Room>>({
    'first-floor': { id: 'first-floor', title: 'Moskee +1', status: 'grey' },
    'beneden': { id: 'beneden', title: 'Moskee +0', status: 'grey' },
    'garage': { id: 'garage', title: 'Garage', status: 'grey' }
  });

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log("Public Imam Dashboard received message:", data);

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
      console.log("Requesting initial status");
      socket.send(JSON.stringify({ type: "getInitialStatus" }));
    }

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, isConnected]);

  return (
    <div className="min-h-screen w-full bg-[url('/static/123.jpg')] bg-cover bg-fixed">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header with Logo */}
        <div className="flex items-center justify-center mb-8">
          <img 
            src="/static/mefen-logo.png" 
            alt="MEFEN Logo" 
            className="h-24 object-contain" 
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#963E56] flex items-center gap-2 justify-center">
            <FaPray className="h-5 w-5" />
            Imam Dashboard
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(rooms).map((room) => (
              <Card
                key={room.id}
                className="overflow-hidden bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
              >
                <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="flex items-center gap-3 text-lg font-semibold text-[#963E56]">
                    <House className="h-5 w-5" />
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
      </div>
    </div>
  );
}
