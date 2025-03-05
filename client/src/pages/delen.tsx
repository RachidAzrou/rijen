import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { FaPray } from "react-icons/fa";

export default function DelenPage() {
  const currentUrl = window.location.origin;
  const imamDashboardUrl = `${currentUrl}/public-imam`;

  return (
    <div className="min-h-screen w-full">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-[#963E56] mb-6 flex items-center gap-2">
          <FaPray className="h-6 w-6" />
          Imam Dashboard delen
        </h1>

        <Card className="overflow-hidden bg-white hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[#963E56]">Publieke Imam Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <QRCodeSVG value={imamDashboardUrl} size={200} level="H" />
            </div>
            <p className="text-sm text-gray-600">
              Scan deze QR code om het publieke Imam Dashboard te bekijken
            </p>
            <p className="text-sm font-medium text-[#963E56] mt-2">
              Of gebruik deze link: <a href={imamDashboardUrl} target="_blank" rel="noopener noreferrer" className="underline">{imamDashboardUrl}</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}