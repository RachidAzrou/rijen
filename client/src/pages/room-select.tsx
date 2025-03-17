import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { LayoutDashboard } from "lucide-react";

// Version stamp for debugging
const VERSION = "DEBUG_V1.1"; // Changed version number
console.log("Room Select Component loaded:", VERSION, new Date().toISOString());

const rooms = [
  { id: "prayer-ground", name: "Gebedsruimte +0" },
  { id: "prayer-first", name: "Gebedsruimte +1" },
  { id: "garage", name: "Garage" }
];

export default function RoomSelect() {
  const [_, setLocation] = useLocation();
  console.log("RoomSelect rendered:", new Date().toISOString()); // Debug log

  const handleRoomSelect = (roomId: string) => {
    console.log("Room selected:", roomId); // Debug log
    setLocation(`/dashboard/${roomId}`);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50/50 flex items-center">
      <div className="container mx-auto px-4 py-6">
        {/* Debug indicator */}
        <div className="fixed top-0 right-0 bg-yellow-200 text-yellow-800 px-2 py-1 text-xs">
          Debug v1.1: {new Date().toLocaleTimeString()}
        </div>

        <Card className="mb-6 bg-white shadow-lg border border-[#963E56]/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-[#963E56]/10 p-3 rounded-full">
                <LayoutDashboard className="h-8 w-8 text-[#963E56]" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#963E56]">
                Dashboard ruimtes
              </h1>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className="bg-white shadow hover:shadow-xl transition-all duration-300 border border-[#963E56]/10"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-[#963E56]/10 p-2 rounded-full">
                    <LayoutDashboard className="h-5 w-5 text-[#963E56]" />
                  </div>
                  <h2 className="text-lg font-semibold text-[#963E56]">
                    {room.name}
                  </h2>
                </div>

                <Button 
                  className="w-full bg-[#963E56] hover:bg-[#963E56]/90 text-white"
                  onClick={() => handleRoomSelect(room.id)}
                >
                  Beheer Ruimte
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}