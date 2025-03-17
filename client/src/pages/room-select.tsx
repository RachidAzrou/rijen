import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { FaPrayingHands } from "react-icons/fa";

const rooms = [
  { id: "prayer-ground", name: "Gebedsruimte +0", capacity: 400 },
  { id: "prayer-first", name: "Gebedsruimte +1", capacity: 300 },
  { id: "garage", name: "Garage", capacity: 100 }
];

export default function RoomSelect() {
  const [_, setLocation] = useLocation();

  const handleRoomSelect = (roomId: string) => {
    setLocation(`/dashboard/${roomId}`);
  };

  return (
    <div className="min-h-screen w-full">
      <div className="container mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-[#963E56]/10">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-[#963E56]/10 p-2 md:p-3 rounded-full">
              <FaPrayingHands className="h-6 w-6 md:h-8 md:w-8 text-[#963E56]" />
            </div>
            <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-[#963E56]">
              Selecteer een Ruimte
            </h1>
          </div>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className="overflow-hidden bg-white hover:shadow-xl transition-all duration-300 border border-[#963E56]/10"
              onClick={() => handleRoomSelect(room.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#963E56]/10 p-2 md:p-3 rounded-full">
                    <FaPrayingHands className="h-6 w-6 text-[#963E56]" />
                  </div>
                  <h2 className="text-lg font-semibold text-[#963E56]">
                    {room.name}
                  </h2>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Capaciteit: {room.capacity} personen
                </p>

                <Button 
                  className="w-full bg-[#963E56] hover:bg-[#963E56]/90 text-white transition-colors"
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