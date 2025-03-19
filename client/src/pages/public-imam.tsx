import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { FaPray } from "react-icons/fa";
import { PiMosqueDuotone } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { translations, type Language } from "@/lib/translations";
import { database } from "@/lib/firebase";
import { ref, onValue, DataSnapshot } from "firebase/database";

const VALID_ROOM_IDS = ['prayer-ground', 'prayer-first', 'garage'] as const;
type RoomId = typeof VALID_ROOM_IDS[number];

const rooms = {
  'prayer-ground': { id: 'prayer-ground', title: 'Gebedsruimte +0', status: 'grey' },
  'prayer-first': { id: 'prayer-first', title: 'Gebedsruimte +1', status: 'grey' },
  'garage': { id: 'garage', title: 'Garage', status: 'grey' }
} as const;

// Prayer icon component met biddend mannetje in cirkel
const PrayerIcon = () => (
  <div className="bg-[#963E56]/10 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center">
    <FaPray className="w-5 h-5 md:w-6 md:h-6 text-[#963E56]" />
  </div>
);

export default function PublicImamDashboard() {
  const [language, setLanguage] = useState<Language>('nl');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [statusMap, setStatusMap] = useState<Record<RoomId, 'green' | 'red' | 'grey'>>({
    'prayer-ground': 'grey',
    'prayer-first': 'grey',
    'garage': 'grey'
  });

  useEffect(() => {
    const roomsRef = ref(database, 'rooms');

    const handleSnapshot = (snapshot: DataSnapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const newStatuses = {} as Record<RoomId, 'green' | 'red' | 'grey'>;
          VALID_ROOM_IDS.forEach(id => {
            newStatuses[id] = 'grey';
          });

          Object.entries(data).forEach(([room, status]) => {
            if (VALID_ROOM_IDS.includes(room as RoomId)) {
              newStatuses[room as RoomId] = status === 'OK' ? 'green' :
                status === 'NOK' ? 'red' :
                'grey';
            }
          });

          setStatusMap(newStatuses);
          setLastUpdate(new Date());
        } else {
          const defaultStatuses = VALID_ROOM_IDS.reduce(
            (acc, id) => ({ ...acc, [id]: 'grey' }),
            {} as Record<RoomId, 'green' | 'red' | 'grey'>
          );
          setStatusMap(defaultStatuses);
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('[Firebase] Error processing snapshot:', error);
      }
    };

    const handleError = (error: Error) => {
      console.error('[Firebase] Database error:', error);
    };

    const unsubscribe = onValue(roomsRef, handleSnapshot, handleError);

    return () => {
      console.log('[Firebase] Cleaning up room status listener');
      unsubscribe();
    };
  }, []);

  const t = translations[language];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-2 py-2 md:px-4 md:py-4 space-y-2 md:space-y-4 flex-grow">
        {/* Header Section - Smaller for mobile */}
        <div className="rounded-xl p-3 md:p-4 bg-white border border-[#963E56]/10">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {language === 'nl' ? (
              <>
                <div className="bg-[#963E56]/10 p-2 rounded-full">
                  <PiMosqueDuotone className="h-6 w-6 md:h-8 md:w-8 text-[#963E56]" />
                </div>
                <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-[#963E56]">
                  {t.pageTitle}
                </h1>
              </>
            ) : (
              <div className="flex flex-row-reverse items-center gap-2 md:gap-4">
                <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-[#963E56]">
                  {t.pageTitle}
                </h1>
                <div className="bg-[#963E56]/10 p-2 rounded-full">
                  <PiMosqueDuotone className="h-6 w-6 md:h-8 md:w-8 text-[#963E56]" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hadith Card - Compact version for mobile */}
        <Card className="bg-gradient-to-br from-[#963E56]/[0.02] to-transparent border border-[#963E56]/5 shadow-none">
          <CardContent className="p-3 md:p-4">
            {language === 'nl' ? (
              <blockquote className="space-y-2 md:space-y-3 text-center">
                <p className="text-sm md:text-base text-[#963E56]/70 font-medium">
                  De Profeet ﷺ zei:
                </p>
                <p className="text-base md:text-lg text-[#963E56]/80 leading-relaxed font-medium">
                  {t.hadithText}
                </p>
                <footer className="text-xs md:text-sm text-[#963E56]/60">
                  — {t.hadithSource}
                </footer>
              </blockquote>
            ) : (
              <div className="space-y-2 md:space-y-3 text-center" dir="rtl">
                <p className="text-sm md:text-base text-[#963E56]/70 font-medium">
                  {t.hadithTitle}
                </p>
                <p className="text-base md:text-lg text-[#963E56]/80 leading-relaxed font-medium">
                  {t.hadithText}
                </p>
                <p className="text-xs md:text-sm text-[#963E56]/60">
                  {t.hadithSource}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Room Status Cards - Compact grid for mobile */}
        <div className="grid gap-2 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(rooms).map(([id, room]) => (
            <Card
              key={id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-[#963E56]/10"
            >
              <CardContent className="p-2 md:p-4">
                <div className="flex items-center justify-between gap-2 md:gap-3">
                  <div className="flex items-center gap-2 flex-grow">
                    <PrayerIcon />
                    <h3 className="text-base md:text-lg font-bold text-[#963E56]">
                      {t.rooms[id as keyof typeof t.rooms]}
                    </h3>
                  </div>
                  <div className={`
                    relative w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center
                    transition-all duration-500 shadow-lg
                    ${statusMap[id as RoomId] === 'green'
                      ? 'bg-[#6BB85C] shadow-[#6BB85C]/30'
                      : statusMap[id as RoomId] === 'red'
                        ? 'bg-red-500 shadow-red-500/30'
                        : 'bg-gray-300'
                    }
                  `}>
                    {statusMap[id as RoomId] === 'green' && 
                      <Check className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    }
                    {statusMap[id as RoomId] === 'red' && 
                      <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    }
                  </div>
                </div>

                <div className="mt-2 md:mt-3 space-y-2">
                  <div className="h-1.5 md:h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        statusMap[id as RoomId] === 'green' ? 'w-full bg-[#6BB85C]' :
                          statusMap[id as RoomId] === 'red' ? 'w-full bg-red-500' :
                            'w-0'
                      }`}
                    />
                  </div>
                  {statusMap[id as RoomId] !== 'grey' && (
                    <div className="text-center">
                      <span className={`
                        inline-block px-3 py-0.5 md:px-4 md:py-1 rounded-full text-xs md:text-sm font-medium
                        ${statusMap[id as RoomId] === 'green'
                          ? 'bg-[#6BB85C]/10 text-[#6BB85C]'
                          : 'bg-red-500/10 text-red-500'
                        }
                      `}>
                        {statusMap[id as RoomId] === 'green' ? t.available : t.unavailable}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center text-xs md:text-sm text-[#963E56]/70">
          {t.lastUpdate}: {lastUpdate.toLocaleTimeString(language === 'nl' ? 'nl-NL' : 'ar-SA')}
        </div>
      </div>

      <LanguageSwitcher language={language} setLanguage={setLanguage} />
    </div>
  );
}

const LanguageSwitcher = ({ language, setLanguage }: { language: Language, setLanguage: (lang: Language) => void }) => (
  <div className="fixed bottom-4 left-4 flex gap-1 p-1 rounded-lg shadow-lg border border-[#963E56]/10 z-50 bg-white">
    <Button
      variant={language === 'nl' ? 'default' : 'ghost'}
      onClick={() => setLanguage('nl')}
      className={`px-3 py-1.5 text-sm font-medium transition-all duration-300 ${
        language === 'nl'
          ? 'bg-[#963E56] text-white hover:bg-[#963E56]/90'
          : 'text-[#963E56] hover:bg-[#963E56]/10'
      }`}
    >
      NL
    </Button>
    <Button
      variant={language === 'ar' ? 'default' : 'ghost'}
      onClick={() => setLanguage('ar')}
      className={`px-3 py-1.5 text-sm font-medium transition-all duration-300 ${
        language === 'ar'
          ? 'bg-[#963E56] text-white hover:bg-[#963E56]/90'
          : 'text-[#963E56] hover:bg-[#963E56]/10'
      }`}
    >
      ع
    </Button>
  </div>
);