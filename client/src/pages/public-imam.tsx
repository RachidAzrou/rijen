import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { useSocket } from "@/lib/use-socket";
import { FaPray } from "react-icons/fa";
import { PiMosqueDuotone } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { translations, type Language } from "@/lib/translations";

// Room type definition
type Room = {
  id: string;
  title: string;
  status: 'green' | 'red' | 'grey';
};

// Language Switcher Component
const LanguageSwitcher = ({ language, setLanguage }: { language: Language, setLanguage: (lang: Language) => void }) => (
  <div className="fixed bottom-4 left-4 flex gap-2 z-50">
    <Button
      variant={language === 'nl' ? 'default' : 'outline'}
      onClick={() => setLanguage('nl')}
      className={`w-12 h-8 ${language === 'nl' ? 'bg-[#963E56] hover:bg-[#963E56]/90' : 'border-[#963E56] text-[#963E56] hover:bg-[#963E56]/10'}`}
    >
      NL
    </Button>
    <Button
      variant={language === 'ar' ? 'default' : 'outline'}
      onClick={() => setLanguage('ar')}
      className={`w-12 h-8 ${language === 'ar' ? 'bg-[#963E56] hover:bg-[#963E56]/90' : 'border-[#963E56] text-[#963E56] hover:bg-[#963E56]/10'}`}
    >
      AR
    </Button>
  </div>
);

// Hadieth Component
const HadiethCard = ({ t, language }: { t: typeof translations.nl, language: Language }) => (
  <Card className="bg-gradient-to-br from-[#963E56]/5 to-transparent border-0 shadow-sm">
    <CardContent className="p-4">
      {language === 'nl' ? (
        <blockquote className="space-y-2 text-center">
          <p className="text-sm text-[#963E56] font-medium mb-2">
            De Profeet ﷺ zei:
          </p>
          <p className="text-sm text-[#963E56] leading-relaxed font-medium italic">
            {t.hadithText}
          </p>
          <footer className="text-xs text-[#963E56]/80">
            — {t.hadithSource}
          </footer>
        </blockquote>
      ) : (
        <div className="space-y-4 text-center" dir="rtl">
          <p className="text-xl md:text-2xl text-[#963E56] leading-relaxed font-medium" style={{ fontFamily: 'Arial, sans-serif' }}>
            {t.hadithTitle}
          </p>
          <p className="text-xl md:text-2xl text-[#963E56] leading-relaxed font-medium" style={{ fontFamily: 'Arial, sans-serif' }}>
            {t.hadithText}
          </p>
          <p className="text-sm text-[#963E56]/80" style={{ fontFamily: 'Arial, sans-serif' }}>
            {t.hadithSource}
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);

export default function PublicImamDashboard() {
  const { socket, isConnected } = useSocket();
  const [language, setLanguage] = useState<Language>('nl');
  const [rooms, setRooms] = useState<Record<string, Room>>({
    'beneden': { id: 'beneden', title: 'Moskee +0', status: 'grey' },
    'first-floor': { id: 'first-floor', title: 'Moskee +1', status: 'grey' },
    'garage': { id: 'garage', title: 'Garage', status: 'grey' }
  });

  React.useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.type === "initialStatus") {
        const updatedRooms = { ...rooms };
        Object.entries(data.data).forEach(([key, value]: [string, any]) => {
          if (updatedRooms[key]) {
            updatedRooms[key].status = value === 'OK' ? 'green' : value === 'NOK' ? 'red' : 'grey';
          }
        });
        setRooms(updatedRooms);
      } else if (data.type === "statusUpdated") {
        setRooms(prev => ({
          ...prev,
          [data.room]: {
            ...prev[data.room],
            status: data.status === 'OK' ? 'green' : data.status === 'NOK' ? 'red' : 'grey'
          }
        }));
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, isConnected]);

  const t = translations[language];

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8 space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-[#963E56]/10">
          <div className="flex items-center justify-center gap-4">
            <div className="bg-[#963E56]/10 p-2 md:p-3 rounded-full">
              <PiMosqueDuotone className="h-6 w-6 md:h-8 md:w-8 text-[#963E56]" />
            </div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#963E56]">
              {t.pageTitle}
            </h1>
          </div>
        </div>

        <HadiethCard t={t} language={language} />

        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(rooms).map((room) => (
            <Card
              key={room.id}
              className="overflow-hidden bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border border-[#963E56]/10"
            >
              <CardHeader className="p-4 md:p-6 pb-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-3 text-base md:text-lg font-semibold text-[#963E56]">
                  <FaPray className="h-5 w-5" />
                  {t.rooms[room.id as keyof typeof t.rooms]}
                </CardTitle>
                <div className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                  ${room.status === 'green' ? 'bg-[#6BB85C] animate-pulse shadow-lg shadow-[#6BB85C]/50' :
                    room.status === 'red' ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' :
                    'bg-gray-300'}
                `}>
                  {room.status === 'green' && <Check className="w-6 h-6 text-white" />}
                  {room.status === 'red' && <X className="w-6 h-6 text-white" />}
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-2">
                <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      room.status === 'green' ? 'w-full bg-[#6BB85C]' :
                      room.status === 'red' ? 'w-full bg-red-500' :
                      'w-0'
                    }`}
                  />
                </div>
                <div className="mt-4 text-center">
                  {room.status !== 'grey' && (
                    <span className={`
                      inline-block px-4 py-1 rounded-full text-sm font-medium
                      ${room.status === 'green' ? 'bg-[#6BB85C]/10 text-[#6BB85C]' :
                        room.status === 'red' ? 'bg-red-500/10 text-red-500' :
                        'bg-gray-100 text-gray-500'}
                    `}>
                      {room.status === 'green' ? t.available :
                       room.status === 'red' ? t.unavailable :
                       ''}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center text-sm text-gray-500 mt-8">
          {t.lastUpdate}: {new Date().toLocaleTimeString(language === 'nl' ? 'nl-NL' : 'ar-SA')}
        </div>

        <LanguageSwitcher language={language} setLanguage={setLanguage} />
      </div>
    </div>
  );
}