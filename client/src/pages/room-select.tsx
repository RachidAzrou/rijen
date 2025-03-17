import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { FaPray } from "react-icons/fa"; 

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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-[#963E56]/10 to-[#6BB85C]/10">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#963E56]">
            Selecteer een Ruimte
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card 
              key={room.id}
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => handleRoomSelect(room.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-[#963E56]/10 p-3 rounded-full">
                    <FaPray className="h-8 w-8 text-[#963E56]" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-center mb-2">
                  {room.name}
                </h2>
                <p className="text-gray-500 text-center text-sm">
                  Capaciteit: {room.capacity} personen
                </p>
                <Button 
                  className="w-full mt-4 bg-[#963E56] hover:bg-[#6BB85C] transition-colors"
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