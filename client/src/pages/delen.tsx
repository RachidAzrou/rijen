import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { House } from "lucide-react";

export default function DelenPage() {
  const currentUrl = window.location.origin;
  const imamDashboardUrl = `${currentUrl}/imam`;

  const rooms = [
    { id: 'first-floor', title: 'Moskee +1', email: 'boven@mefen.be' },
    { id: 'beneden', title: 'Moskee +0', email: 'beneden@mefen.be' },
    { id: 'garage', title: 'Garage', email: 'garage@mefen.be' }
  ];

  return (
    <div className="min-h-screen w-full">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-[#963E56] mb-6">
          QR Codes delen
        </h1>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#963E56]">
                  <House className="h-5 w-5" />
                  {room.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <QRCodeSVG value={`${currentUrl}?room=${room.id}`} size={200} level="H" />
                </div>
                <p className="text-sm text-gray-600">
                  Scan deze QR code om de status van {room.title} te bekijken
                </p>
              </CardContent>
            </Card>
          ))}

          {/* Imam Dashboard QR */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-[#963E56]">Imam Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <QRCodeSVG value={imamDashboardUrl} size={200} level="H" />
              </div>
              <p className="text-sm text-gray-600">
                Scan deze QR code om het Imam Dashboard te bekijken
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
