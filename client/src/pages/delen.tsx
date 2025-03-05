import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { FaPray } from "react-icons/fa";
import { Share2 } from "lucide-react";

export default function DelenPage() {
  const currentUrl = window.location.origin;
  const imamDashboardUrl = `${currentUrl}/public-imam`;

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-[#963E56]/10">
          <div className="flex items-center gap-4">
            <div className="bg-[#963E56]/10 p-3 rounded-full">
              <Share2 className="h-8 w-8 text-[#963E56]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#963E56]">
                Imam Dashboard delen
              </h1>
              <p className="text-gray-600 mt-1">
                Deel de publieke imam dashboard met QR code of link
              </p>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden bg-white hover:shadow-xl transition-all duration-300 border border-[#963E56]/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-[#963E56]">
              <FaPray className="h-5 w-5" />
              Publieke Imam Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6 p-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-[#963E56]/10">
              <QRCodeSVG 
                value={imamDashboardUrl} 
                size={200} 
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center space-y-3">
              <p className="text-gray-600">
                Scan deze QR code om het publieke Imam Dashboard te bekijken
              </p>
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium text-[#963E56]">Of gebruik deze link:</span>
                <a 
                  href={imamDashboardUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#963E56] hover:text-[#6BB85C] transition-colors duration-300 underline mt-1"
                >
                  {imamDashboardUrl}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}