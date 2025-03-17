import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { LayoutDashboard, User, ChevronDown } from "lucide-react";
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
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="shadow-lg p-4 md:p-6 border border-[#963E56]/10 rounded-xl">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-[#963E56]/10 p-2 md:p-3 rounded-full">
              <LayoutDashboard className="h-6 w-6 md:h-8 md:w-8 text-[#963E56]" />
            </div>
            <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-[#963E56]">
              Dashboard Ruimtes
            </h1>
          </div>
        </div>

        <Card className="shadow-lg border border-[#963E56]/10">
          <CardContent className="p-4 md:p-6">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-4 text-lg md:text-xl font-semibold text-[#963E56] hover:bg-[#963E56]/5 bg-white rounded-lg shadow-sm border border-[#963E56]/10 mb-4"
            >
              <div className="flex items-center gap-3">
                <User className="h-6 w-6" />
                <span>Status Gebedsruimtes</span>
              </div>
              <ChevronDown className="h-5 w-5" />
            </Button>

            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <Card
                  key={room.id}
                  className="shadow hover:shadow-xl transition-all duration-300 border border-[#963E56]/10"
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="shadow-lg p-3 md:p-4 border border-[#963E56]/10 rounded-xl mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#963E56]/10 p-2 rounded-full">
                          <FaPray className="h-5 w-5 text-[#963E56]" />
                        </div>
                        <h3 className="text-xl font-semibold text-[#963E56]">
                          {room.name}
                        </h3>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-[#963E56] hover:bg-[#963E56]/90 text-white mt-4"
                      onClick={() => handleRoomSelect(room.id)}
                    >
                      Beheer Ruimte
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}