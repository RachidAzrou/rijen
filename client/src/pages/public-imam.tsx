import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { PiMosqueDuotone } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { translations, type Language } from "@/lib/translations";
import { database } from "@/lib/firebase";
import { ref, onValue, DataSnapshot } from "firebase/database";

const VALID_ROOM_IDS = ['prayer-first', 'prayer-ground', 'garage'] as const;
type RoomId = typeof VALID_ROOM_IDS[number];

const rooms = {
  'prayer-first': { id: 'prayer-first', title: 'Gebedsruimte +1', status: 'grey' },
  'prayer-ground': { id: 'prayer-ground', title: 'Gebedsruimte +0', status: 'grey' },
  'garage': { id: 'garage', title: 'Garage', status: 'grey' }
} as const;

// Importeer het prayer icon component
const PrayerIcon = () => (
  <div className="bg-[#963E56]/10 w-8 h-8 rounded-full flex items-center justify-center">
    <PiMosqueDuotone className="w-5 h-5 text-[#963E56]" />
  </div>
);

export default function PublicImamDashboard() {
  const [language, setLanguage] = useState<Language>('nl');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [statusMap, setStatusMap] = useState<Record<RoomId, 'green' | 'red' | 'grey'>>({
    'prayer-first': 'grey',
    'prayer-ground': 'grey',
    'garage': 'grey'
  });

  useEffect(() => {
    console.log('[Firebase] Setting up room status listener');
    const roomsRef = ref(database, 'rooms');

    const handleSnapshot = (snapshot: DataSnapshot) => {
      try {
        const data = snapshot.val();
        console.log('[Firebase] Received room data:', data);

        if (data) {
          const newStatuses = {} as Record<RoomId, 'green' | 'red' | 'grey'>;

          // Initialize all rooms to grey first
          VALID_ROOM_IDS.forEach(id => {
            newStatuses[id] = 'grey';
          });

          // Update with received data
          Object.entries(data).forEach(([room, status]) => {
            if (VALID_ROOM_IDS.includes(room as RoomId)) {
              newStatuses[room as RoomId] = status === 'OK' ? 'green' :
                                         status === 'NOK' ? 'red' :
                                         'grey';
            }
          });

          console.log('[Firebase] Updated room statuses:', newStatuses);
          setStatusMap(newStatuses);
          setLastUpdate(new Date());
        } else {
          console.log('[Firebase] No data received, setting all rooms to grey');
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

    console.log('[Firebase] Attaching onValue listener to:', roomsRef.toString());
    const unsubscribe = onValue(roomsRef, handleSnapshot, handleError);

    return () => {
      console.log('[Firebase] Cleaning up room status listener');
      unsubscribe();
    };
  }, []);

  const t = translations[language];

  return (
    <div className="min-h-screen w-full" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="rounded-xl p-6 bg-white border border-[#963E56]/10">
          <div className="flex items-center justify-center gap-4">
            {language === 'nl' ? (
              <>
                <div className="bg-[#963E56]/10 p-3 rounded-full">
                  <PiMosqueDuotone className="h-8 w-8 text-[#963E56]" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-[#963E56]">
                  {t.pageTitle}
                </h1>
              </>
            ) : (
              <div className="flex flex-row-reverse items-center gap-4">
                <h1 className="text-3xl lg:text-4xl font-bold text-[#963E56]">
                  {t.pageTitle}
                </h1>
                <div className="bg-[#963E56]/10 p-3 rounded-full">
                  <PiMosqueDuotone className="h-8 w-8 text-[#963E56]" />
                </div>
              </div>
            )}
          </div>
        </div>

        <HadiethCard t={t} language={language} />

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(rooms).map(([id, room]) => (
            <Card
              key={id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-[#963E56]/10"
            >
              <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className={`flex items-center gap-3 text-lg font-semibold text-[#963E56] ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  {language === 'nl' ? (
                    <>
                      <PrayerIcon />
                      {t.rooms[id as keyof typeof t.rooms]}
                    </>
                  ) : (
                    <>
                      {t.rooms[id as keyof typeof t.rooms]}
                      <PrayerIcon />
                    </>
                  )}
                </CardTitle>
                <div className={`
                  relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
                  ${statusMap[id as RoomId] === 'green' ? 'bg-[#6BB85C] shadow-lg shadow-[#6BB85C]/50' :
                    statusMap[id as RoomId] === 'red' ? 'bg-red-500 shadow-lg shadow-red-500/50' :
                    'bg-gray-300'}
                `}>
                  {statusMap[id as RoomId] === 'green' && <Check className="w-7 h-7 text-white" />}
                  {statusMap[id as RoomId] === 'red' && <X className="w-7 h-7 text-white" />}
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <div className="mt-4 h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      statusMap[id as RoomId] === 'green' ? 'w-full bg-[#6BB85C]' :
                      statusMap[id as RoomId] === 'red' ? 'w-full bg-red-500' :
                      'w-0'
                    }`}
                  />
                </div>
                <div className="mt-6 text-center">
                  {statusMap[id as RoomId] !== 'grey' && (
                    <span className={`
                      inline-block px-6 py-2 rounded-full text-base font-medium
                      ${statusMap[id as RoomId] === 'green' ? 'bg-[#6BB85C]/10 text-[#6BB85C]' :
                        statusMap[id as RoomId] === 'red' ? 'bg-red-500/10 text-red-500' :
                        'bg-gray-100 text-gray-500'}
                    `}>
                      {statusMap[id as RoomId] === 'green' ? t.available :
                        statusMap[id as RoomId] === 'red' ? t.unavailable :
                        ''}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center text-base text-[#963E56]/70 mt-8">
          {t.lastUpdate}: {lastUpdate.toLocaleTimeString(language === 'nl' ? 'nl-NL' : 'ar-SA')}
        </div>

        <LanguageSwitcher language={language} setLanguage={setLanguage} />
      </div>
    </div>
  );
}

const LanguageSwitcher = ({ language, setLanguage }: { language: Language, setLanguage: (lang: Language) => void }) => (
  <div className="fixed bottom-4 left-4 flex gap-1 p-1 rounded-lg shadow-lg border border-[#963E56]/10 z-50">
    <Button
      variant={language === 'nl' ? 'default' : 'ghost'}
      onClick={() => setLanguage('nl')}
      className={`px-6 py-2 text-base font-medium transition-all duration-300 ${
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
      className={`px-6 py-2 text-base font-medium transition-all duration-300 ${
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
  <Card className="bg-gradient-to-br from-[#963E56]/5 to-transparent border border-[#963E56]/10 shadow-sm">
    <CardContent className="p-8">
      {language === 'nl' ? (
        <blockquote className="space-y-4 text-center">
          <p className="text-2xl lg:text-3xl text-[#963E56] font-medium">
            De Profeet ﷺ zei:
          </p>
          <p className="text-2xl lg:text-3xl text-[#963E56] leading-relaxed font-medium italic">
            {t.hadithText}
          </p>
          <footer className="text-base text-[#963E56]/80 mt-4">
            — {t.hadithSource}
          </footer>
        </blockquote>
      ) : (
        <div className="space-y-6 text-center" dir="rtl">
          <p className="text-2xl lg:text-3xl text-[#963E56] leading-relaxed font-medium">
            {t.hadithTitle}
          </p>
          <p className="text-2xl lg:text-3xl text-[#963E56] leading-relaxed font-medium">
            {t.hadithText}
          </p>
          <p className="text-base text-[#963E56]/80 mt-4">
            {t.hadithSource}
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);