import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSocket } from "@/lib/use-socket";
import { Button } from "@/components/ui/button";

type Room = {
  id: string;
  title: string;
  status: string;
};

type RoomStatus = {
  [key: string]: Room;
};

export function SufufPage() {
  const { socket, isConnected } = useSocket();
  const [rooms, setRooms] = useState<RoomStatus>({});

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "initialStatus") {
        setRooms(data.data);
      } else if (data.type === "statusUpdated") {
        setRooms((prev) => ({
          ...prev,
          [data.data.room]: {
            ...prev[data.data.room],
            status: data.data.status,
          },
        }));
      }
    };
  }, [socket]);

  const updateStatus = (roomId: string, status: "OK" | "NOK" | "RESET") => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "updateStatus", room: roomId, status }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "green":
        return "bg-[#6BB85C] text-white";
      case "red":
        return "bg-[#963E56] text-white";
      default:
        return "bg-[#D9A347] text-white";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <img src="/static/moskee.png" alt="Sufuf" className="h-16" />
            <h1 className="text-2xl font-bold text-[#963E56] mt-4">Sufuf Dashboard</h1>
          </div>
          <div className="text-sm">
            <span className={`inline-block w-3 h-3 rounded-full ${
              isConnected ? "bg-[#6BB85C]" : "bg-[#963E56]"
            } mr-2`}></span>
            {isConnected ? "Verbonden" : "Niet verbonden"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(rooms).map((room) => (
            <Card key={room.id} className="overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">{room.title}</h2>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${getStatusColor(room.status)}`}>
                    Status: {room.status === "green" ? "Compleet" : room.status === "red" ? "Incompleet" : "Onbekend"}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => updateStatus(room.id, "OK")}
                      className="bg-[#6BB85C] hover:bg-[#6BB85C]/90"
                    >
                      OK
                    </Button>
                    <Button
                      onClick={() => updateStatus(room.id, "NOK")}
                      className="bg-[#963E56] hover:bg-[#963E56]/90"
                    >
                      NOK
                    </Button>
                    <Button
                      onClick={() => updateStatus(room.id, "RESET")}
                      className="bg-[#D9A347] hover:bg-[#D9A347]/90"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
