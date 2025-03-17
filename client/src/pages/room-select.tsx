import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
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
    <div className="flex flex-col min-h-screen w-full bg-gray-50/50"> {/* Added flex-col to prevent unnecessary scrolling */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="mb-6 bg-white shadow-lg border border-[#963E56]/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <LayoutDashboard className="h-8 w-8 text-[#963E56]" />
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
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="h-5 w-5 text-[#963E56]" />
                  <h2 className="text-lg font-semibold text-[#963E56]">
                    {room.name}
                  </h2>
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
      </div>
    </div>
  );
}