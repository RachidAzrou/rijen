import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { useSocket } from "@/lib/use-socket";
import { FaPray } from "react-icons/fa";
import { PiMosqueDuotone } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { translations, type Language } from "@/lib/translations";

const ROOM_STATUSES_KEY = 'room_statuses';

// Update the room IDs to match the server
const VALID_ROOM_IDS = ['first-floor', 'beneden', 'garage'] as const;
type RoomId = typeof VALID_ROOM_IDS[number];

// Make sure room IDs match exactly with other components
const rooms = {
  'first-floor': { id: 'first-floor', title: 'Gebedsruimte +1', status: 'grey' },
  'beneden': { id: 'beneden', title: 'Gebedsruimte +0', status: 'grey' },
  'garage': { id: 'garage', title: 'Garage', status: 'grey' }
} as const;

const LanguageSwitcher = ({ language, setLanguage }: { language: Language, setLanguage: (lang: Language) => void }) => (
  <div className="fixed bottom-4 left-4 flex gap-1 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-lg border border-[#963E56]/10 z-50">
    <Button
      variant={language === 'nl' ? 'default' : 'ghost'}
      onClick={() => setLanguage('nl')}
      className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
        language === 'nl'
          ? 'bg-[#963E56] text-white hover:bg-[#963E56]/90'
          : 'text-[#963E56] hover:bg-[#963E56]/10'
      }`}
    >
      Nederlands
    </Button>
    <Button
      variant={language === 'ar' ? 'default' : 'ghost'}
      onClick={() => setLanguage('ar')}
      className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
        language === 'ar'
          ? 'bg-[#963E56] text-white hover:bg-[#963E56]/90'
          : 'text-[#963E56] hover:bg-[#963E56]/10'
      }`}
    >
      العربية
    </Button>
  </div>
);

const HadiethCard = ({ t, language }: { t: typeof translations.nl, language: Language }) => (
  <Card className="bg-gradient-to-br from-[#963E56]/5 to-transparent border-0 shadow-sm">
    <CardContent className="p-4">
      {language === 'nl' ? (
        <blockquote className="space-y-2 text-center">
          <p className="text-base md:text-lg text-[#963E56] font-medium mb-2">
            De Profeet ﷺ zei:
          </p>
          <p className="text-base md:text-lg text-[#963E56] leading-relaxed font-medium italic">
            {t.hadithText}
          </p>
          <footer className="text-sm text-[#963E56]/80">
            — {t.hadithSource}
          </footer>
        </blockquote>
      ) : (
        <div className="space-y-4 text-center" dir="rtl">
          <p className="text-xl md:text-2xl text-[#963E56] leading-relaxed font-medium">
            {t.hadithTitle}
          </p>
          <p className="text-xl md:text-2xl text-[#963E56] leading-relaxed font-medium">
            {t.hadithText}
          </p>
          <p className="text-sm text-[#963E56]/80">
            {t.hadithSource}
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);

const PublicImamDashboard = () => {
  const { socket, isConnected, sendMessage } = useSocket();
  const [language, setLanguage] = useState<Language>('nl');

  // Load initial statuses from localStorage
  const [roomStatuses, setRoomStatuses] = useState<Record<RoomId, 'green' | 'red' | 'grey'>>(() => {
    try {
      const stored = localStorage.getItem(ROOM_STATUSES_KEY);
      console.log('[PublicImam] Loading stored statuses:', stored);
      const defaultStatuses = Object.keys(rooms).reduce((acc, key) => ({ 
        ...acc, 
        [key]: 'grey' 
      }), {} as Record<RoomId, 'green' | 'red' | 'grey'>);

      if (stored) {
        const parsedStatuses = JSON.parse(stored);
        console.log('[PublicImam] Parsed stored statuses:', parsedStatuses);
        // Ensure we only use valid room IDs
        const validStatuses = VALID_ROOM_IDS.reduce((acc, roomId) => ({
          ...acc,
          [roomId]: parsedStatuses[roomId] || 'grey'
        }), {} as Record<RoomId, 'green' | 'red' | 'grey'>);
        return validStatuses;
      }
      return defaultStatuses;
    } catch (error) {
      console.error('[PublicImam] Error loading stored statuses:', error);
      return Object.keys(rooms).reduce((acc, key) => ({ 
        ...acc, 
        [key]: 'grey' 
      }), {} as Record<RoomId, 'green' | 'red' | 'grey'>);
    }
  });

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('[PublicImam] Socket not connected yet');
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[PublicImam] Received WebSocket message:', data);

        if (data.type === "initialStatus") {
          console.log('[PublicImam] Processing initial status:', data.data);
          const newStatuses = { ...roomStatuses };
          Object.entries(data.data).forEach(([room, status]: [string, any]) => {
            if (VALID_ROOM_IDS.includes(room as RoomId)) {
              console.log(`[PublicImam] Setting status for room ${room} to ${status}`);
              newStatuses[room as RoomId] = status === 'OK' ? 'green' : status === 'NOK' ? 'red' : 'grey';
            } else {
              console.warn(`[PublicImam] Received status for unknown room: ${room}`);
            }
          });
          console.log('[PublicImam] Final room statuses:', newStatuses);
          setRoomStatuses(newStatuses);
          localStorage.setItem(ROOM_STATUSES_KEY, JSON.stringify(newStatuses));
        } else if (data.type === "statusUpdated") {
          console.log(`[PublicImam] Processing status update for room ${data.room}: ${data.status}`);
          if (VALID_ROOM_IDS.includes(data.room as RoomId)) {
            setRoomStatuses(prev => {
              const newStatuses = {
                ...prev,
                [data.room as RoomId]: data.status === 'OK' ? 'green' : data.status === 'NOK' ? 'red' : 'grey'
              };
              console.log('[PublicImam] Updated room statuses:', newStatuses);
              localStorage.setItem(ROOM_STATUSES_KEY, JSON.stringify(newStatuses));
              return newStatuses;
            });
          } else {
            console.warn(`[PublicImam] Received status update for unknown room: ${data.room}`);
          }
        }
      } catch (error) {
        console.error('[PublicImam] Error handling WebSocket message:', error);
      }
    };

    console.log('[PublicImam] Setting up WebSocket handler for rooms:', VALID_ROOM_IDS);
    socket.addEventListener('message', handleMessage);

    // Request initial status
    console.log('[PublicImam] Requesting initial status');
    sendMessage(JSON.stringify({ type: "getInitialStatus" }));

    return () => {
      console.log('[PublicImam] Cleaning up WebSocket handler');
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, isConnected, sendMessage]);

  const t = translations[language];

  return (
    <div className="min-h-screen w-full" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-6 md:py-8 space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-[#963E56]/10">
          <div className="flex items-center justify-center gap-4">
            {language === 'nl' ? (
              <>
                <div className="bg-[#963E56]/10 p-2 md:p-3 rounded-full">
                  <PiMosqueDuotone className="h-6 w-6 md:h-8 md:w-8 text-[#963E56]" />
                </div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#963E56]">
                  {t.pageTitle}
                </h1>
              </>
            ) : (
              <div className="flex flex-row-reverse items-center gap-4">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#963E56]">
                  {t.pageTitle}
                </h1>
                <div className="bg-[#963E56]/10 p-2 md:p-3 rounded-full">
                  <PiMosqueDuotone className="h-6 w-6 md:h-8 md:w-8 text-[#963E56]" />
                </div>
              </div>
            )}
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
                <CardTitle className={`flex items-center gap-3 text-base md:text-lg font-semibold text-[#963E56] ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  {language === 'nl' ? (
                    <>
                      <FaPray className="h-5 w-5" />
                      {t.rooms[room.id as keyof typeof t.rooms]}
                    </>
                  ) : (
                    <>
                      {t.rooms[room.id as keyof typeof t.rooms]}
                      <FaPray className="h-5 w-5" />
                    </>
                  )}
                </CardTitle>
                <div className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                  ${roomStatuses[room.id] === 'green' ? 'bg-[#6BB85C] shadow-lg shadow-[#6BB85C]/50' :
                    roomStatuses[room.id] === 'red' ? 'bg-red-500 shadow-lg shadow-red-500/50' :
                    'bg-gray-300'}
                `}>
                  {roomStatuses[room.id] === 'green' && <Check className="w-6 h-6 text-white" />}
                  {roomStatuses[room.id] === 'red' && <X className="w-6 h-6 text-white" />}
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-2">
                <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      roomStatuses[room.id] === 'green' ? 'w-full bg-[#6BB85C]' :
                      roomStatuses[room.id] === 'red' ? 'w-full bg-red-500' :
                      'w-0'
                    }`}
                  />
                </div>
                <div className="mt-4 text-center">
                  {roomStatuses[room.id] !== 'grey' && (
                    <span className={`
                      inline-block px-4 py-1 rounded-full text-sm font-medium
                      ${roomStatuses[room.id] === 'green' ? 'bg-[#6BB85C]/10 text-[#6BB85C]' :
                        roomStatuses[room.id] === 'red' ? 'bg-red-500/10 text-red-500' :
                        'bg-gray-100 text-gray-500'}
                    `}>
                      {roomStatuses[room.id] === 'green' ? t.available :
                        roomStatuses[room.id] === 'red' ? t.unavailable :
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
};

export default PublicImamDashboard;