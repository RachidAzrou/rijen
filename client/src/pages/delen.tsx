import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { FaPray } from "react-icons/fa";
import { Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DelenPage() {
  const [showFullscreenQR, setShowFullscreenQR] = useState(false);
  const currentUrl = window.location.origin;
  const publicDashboardUrl = `${currentUrl}/public-imam`;

  return (
    <div 
      className="min-h-screen w-full"
      style={{
        background: `linear-gradient(135deg, rgba(245, 247, 250, 0.7), rgba(195, 207, 226, 0.7)), url('/static/123.jpg') center center/cover no-repeat fixed`
      }}
    >
      <div className="container mx-auto px-4 pt-4 pb-8 space-y-8">
        {/* Header - aangepaste padding */}
        <div className="bg-white rounded-xl shadow-lg p-4 border border-[#963E56]/10">
          <div className="flex items-center gap-4">
            <div className="bg-[#963E56]/10 p-3 rounded-full">
              <Share2 className="h-8 w-8 text-[#963E56]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#963E56]">
                Delen
              </h1>
              <p className="text-gray-600 mt-1">
                Deel het publieke dashboard met QR code of link
              </p>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden bg-white hover:shadow-xl transition-all duration-300 border border-[#963E56]/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-[#963E56]">
              <FaPray className="h-5 w-5" />
              Publiek Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6 p-8">
            <button
              onClick={() => setShowFullscreenQR(true)}
              className="bg-white p-6 rounded-xl shadow-lg border border-[#963E56]/10 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <QRCodeSVG 
                value={publicDashboardUrl} 
                size={200} 
                level="H"
                includeMargin={true}
              />
            </button>
            <div className="text-center space-y-3">
              <p className="text-gray-600">
                Scan deze QR code om het publieke dashboard te bekijken
              </p>
              <div className="flex flex-col items-center bg-[#963E56]/5 p-4 rounded-lg">
                <span className="text-sm font-medium text-[#963E56] mb-2">Of gebruik deze link:</span>
                <a 
                  href={publicDashboardUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#963E56] hover:text-[#6BB85C] transition-colors duration-300 underline break-all text-center"
                >
                  {publicDashboardUrl}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fullscreen QR Code Modal */}
        {showFullscreenQR && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowFullscreenQR(false)}>
            <div className="bg-white p-8 rounded-xl relative max-w-xl w-full mx-4">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setShowFullscreenQR(false)}
              >
                <X className="h-6 w-6" />
              </Button>
              <div className="flex justify-center">
                <QRCodeSVG 
                  value={publicDashboardUrl} 
                  size={400}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}