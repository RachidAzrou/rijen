import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { FaPray } from "react-icons/fa";
import { LayoutDashboard } from "lucide-react";

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
    <div className="min-h-screen w-full flex flex-col">
      <div className="container mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6 flex-grow">
        <div className="bg-white shadow-lg p-4 md:p-6 border border-[#963E56]/10 rounded-xl">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-[#963E56]/10 p-2 md:p-3 rounded-full">
              <LayoutDashboard className="h-6 w-6 md:h-8 md:w-8 text-[#963E56]" />
            </div>
            <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-[#963E56]">
              Dashboard Ruimtes
            </h1>
          </div>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className="group bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-[#963E56]/10"
            >
              <CardContent className="p-4 md:p-6">
                <div className="shadow-lg p-3 md:p-4 bg-white border border-[#963E56]/10 rounded-xl mb-4 group-hover:border-[#963E56]/20 transition-colors duration-300">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#963E56]/10 p-2 rounded-full group-hover:bg-[#963E56]/20 transition-colors duration-300">
                      <FaPray className="h-5 w-5 text-[#963E56]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#963E56]">
                      {room.name}
                    </h3>
                  </div>
                </div>

                <Button
                  className="w-full bg-[#963E56] hover:bg-[#963E56]/90 text-white transition-colors duration-300 h-10"
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