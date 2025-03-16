import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Building2 } from "lucide-react"; // Changed from Mosque to Building2 as it exists in lucide-react

const rooms = [
  { id: "main-hall", name: "Hoofdzaal", capacity: 500 },
  { id: "womens-hall", name: "Vrouwenzaal", capacity: 200 },
  { id: "study-room", name: "Studieruimte", capacity: 50 }
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
          <h1 className="text-3xl font-bold text-[#963E56] mb-4">
            Selecteer een Ruimte
          </h1>
          <p className="text-gray-600">
            Kies een ruimte om het dashboard en vrijwilligersacties te beheren
          </p>
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
                  <Building2 className="h-12 w-12 text-[#963E56]" />
                </div>
                <h2 className="text-xl font-semibold text-center mb-2">
                  {room.name}
                </h2>
                <p className="text-gray-500 text-center text-sm">
                  Capaciteit: {room.capacity} personen
                </p>
                <Button 
                  className="w-full mt-4 bg-[#963E56] hover:bg-[#6BB85C]"
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