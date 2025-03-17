import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { FaPray } from "react-icons/fa";

const rooms = [
  { id: "prayer-ground", name: "Gebedsruimte +0" },
  { id: "prayer-first", name: "Gebedsruimte +1" },
  { id: "garage", name: "Garage" }
];

export default function RoomSelect() {
  const [_, setLocation] = useLocation();

  const handleRoomSelect = (roomId: string) => {
    setLocation(`/dashboard/${roomId}`);
  };

  return (
    <div className="h-screen w-full bg-gray-50/50 overflow-hidden flex flex-col">
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6 bg-white shadow-lg border border-[#963E56]/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-[#963E56]/10 p-3 rounded-full">
                <FaPray className="h-8 w-8 text-[#963E56]" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#963E56]">
                Selecteer een Ruimte
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#963E56]">
                    {room.name}
                  </h2>
                  <div className="bg-[#963E56]/10 p-2 rounded-full">
                    <FaPray className="h-5 w-5 text-[#963E56]" />
                  </div>
                </div>

                <Button 
                  className="w-full bg-[#963E56] hover:bg-[#963E56]/90 text-white"
                  onClick={() => handleRoomSelect(room.id)}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaPray className="h-4 w-4" />
                    <span>Beheer Ruimte</span>
                  </div>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}