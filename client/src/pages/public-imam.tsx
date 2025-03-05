import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, House } from "lucide-react";
import { useSocket } from "@/lib/use-socket";
import { FaPray } from "react-icons/fa";
import { useState, useEffect } from "react";

// Hadieth Component
const HadiethCard = () => (
  <Card className="bg-gradient-to-br from-[#963E56]/5 to-transparent border-0 shadow-sm">
    <CardContent className="p-4">
      <div className="space-y-4 text-center" dir="rtl">
        <p className="text-xl md:text-2xl text-[#963E56] leading-relaxed font-medium" style={{ fontFamily: 'Arial, sans-serif' }}>
          قال رسول الله ﷺ
        </p>
        <p className="text-xl md:text-2xl text-[#963E56] leading-relaxed font-medium" style={{ fontFamily: 'Arial, sans-serif' }}>
          سَوُّوا صُفُوفَكُمْ، فَإِنَّ تَسْوِيَةَ الصُّفُوفِ مِنْ تَمَامِ الصَّلَاةِ
        </p>
        <p className="text-sm text-[#963E56]/80" style={{ fontFamily: 'Arial, sans-serif' }}>
          رواه البخاري ومسلم
        </p>
      </div>
    </CardContent>
  </Card>
);

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
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, isConnected]);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Header met Logo */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-[#963E56]/10">
          <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-[#963E56]/10 p-2 md:p-3 rounded-full">
                <FaPray className="h-6 w-6 md:h-8 md:w-8 text-[#963E56]" />
              </div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#963E56]">
                Imam Dashboard
              </h1>
            </div>
            <div className="shrink-0">
              <img 
                src="/static/Naamloos.png" 
                alt="MEFEN Logo" 
                className="h-12 md:h-16 object-contain" 
              />
            </div>
          </div>
        </div>

        {/* Hadieth Card */}
        <HadiethCard />

        {/* Rooms Grid */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(rooms).map((room) => (
            <Card
              key={room.id}
              className="overflow-hidden bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border border-[#963E56]/10"
            >
              <CardHeader className="p-4 md:p-6 pb-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-3 text-base md:text-lg font-semibold text-[#963E56]">
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
              <CardContent className="p-4 md:p-6 pt-2">
                <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      room.status === 'green' ? 'w-full bg-[#6BB85C]' :
                      room.status === 'red' ? 'w-full bg-red-500' :
                      'w-0'
                    }`}
                  />
                </div>
                {/* Status Text */}
                <div className="mt-4 text-center">
                  <span className={`
                    inline-block px-4 py-1 rounded-full text-sm font-medium
                    ${room.status === 'green' ? 'bg-[#6BB85C]/10 text-[#6BB85C]' :
                      room.status === 'red' ? 'bg-red-500/10 text-red-500' :
                      'bg-gray-100 text-gray-500'}
                  `}>
                    {room.status === 'green' ? 'Beschikbaar' :
                     room.status === 'red' ? 'Niet Beschikbaar' :
                     'Onbekend'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer met timestamp */}
        <div className="text-center text-sm text-gray-500 mt-8">
          Laatste update: {new Date().toLocaleTimeString('nl-NL')}
        </div>
      </div>
    </div>
  );
}