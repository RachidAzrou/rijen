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
    <div className="min-h-screen w-full flex flex-col overflow-hidden">
      <div className="container mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6 flex-grow">
        <Card className="bg-white rounded-xl shadow-lg border border-[#963E56]/10">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-[#963E56]/10 p-2 md:p-3 rounded-full">
                <FaPray className="h-6 w-6 md:h-8 md:w-8 text-[#963E56]" />
              </div>
              <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-[#963E56]">
                Selecteer een Ruimte
              </h1>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className="overflow-hidden bg-white hover:shadow-xl transition-all duration-300 border border-[#963E56]/10"
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base md:text-lg font-semibold text-[#963E56]">
                    {room.name}
                  </h2>
                  <div className="bg-[#963E56]/10 p-2 rounded-full">
                    <FaPray className="h-5 w-5 text-[#963E56]" />
                  </div>
                </div>

                <Button 
                  className="w-full mt-4 bg-[#963E56] hover:bg-[#963E56]/90 text-white transition-colors"
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