import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      unsubscribe();
    };
  }, []);

  const t = translations[language];

  return (
    <div className="absolute inset-0 grid grid-rows-[auto_1fr] bg-gray-50/50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="px-3 md:px-4 pt-4">
        <div className="rounded-lg md:rounded-xl p-3 md:p-4 bg-white border border-[#963E56]/10">
          <div className="flex items-center justify-center gap-4">
            {language === 'nl' ? (
              <>
                <div className="bg-[#963E56]/10 p-2 md:p-3 rounded-full">
                  <PiMosqueDuotone className="h-6 w-6 md:h-7 md:w-7 text-[#963E56]" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#963E56]">
                  {t.pageTitle}
                </h1>
              </>
            ) : (
              <div className="flex flex-row-reverse items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-[#963E56]">
                  {t.pageTitle}
                </h1>
                <div className="bg-[#963E56]/10 p-2 md:p-3 rounded-full">
                  <PiMosqueDuotone className="h-6 w-6 md:h-7 md:w-7 text-[#963E56]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 md:px-4 py-4 grid grid-rows-[auto_1fr_auto] gap-4">
        {/* Hadith Card */}
        <Card className="bg-white/80 backdrop-blur-sm border border-[#963E56]/5 shadow-none">
          <CardContent className="p-4 md:p-6">
            {language === 'nl' ? (
              <blockquote className="space-y-3 md:space-y-4 text-center">
                <p className="text-base text-[#963E56]/70 font-medium">
                  {t.hadithTitle}
                </p>
                <p className="text-base text-[#963E56]/80 leading-relaxed font-medium">
                  {t.hadithText}
                </p>
                <footer className="text-sm text-[#963E56]/60 mt-2">
                  — {t.hadithSource}
                </footer>
              </blockquote>
            ) : (
              <div className="space-y-3 md:space-y-4 text-center" dir="rtl">
                <p className="text-base text-[#963E56]/70 font-medium">
                  {t.hadithTitle}
                </p>
                <p className="text-base text-[#963E56]/80 leading-relaxed font-medium">
                  {t.hadithText}
                </p>
                <p className="text-sm text-[#963E56]/60 mt-2">
                  {t.hadithSource}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Room Status Cards */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(rooms).map(([id, room]) => (
            <Card
              key={id}
              className="bg-white/80 backdrop-blur-sm border border-[#963E56]/10 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className={`flex items-center gap-3 text-lg font-semibold text-[#963E56] ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  {language === 'nl' ? (
                    <>
                      <div className="bg-[#963E56]/10 p-2 rounded-full">
                        <FaPray className="h-5 w-5 text-[#963E56]" />
                      </div>
                      {t.rooms[id as keyof typeof t.rooms]}
                    </>
                  ) : (
                    <>
                      {t.rooms[id as keyof typeof t.rooms]}
                      <div className="bg-[#963E56]/10 p-2 rounded-full">
                        <FaPray className="h-5 w-5 text-[#963E56]" />
                      </div>
                    </>
                  )}
                </CardTitle>
                <div className={`
                  relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
                  ${statusMap[id as RoomId] === 'green'
                    ? 'bg-[#6BB85C] shadow-lg shadow-[#6BB85C]/50'
                    : statusMap[id as RoomId] === 'red'
                      ? 'bg-red-500 shadow-lg shadow-red-500/50'
                      : 'bg-gray-300'}
                `}>
                  {statusMap[id as RoomId] === 'green' && <Check className="w-7 h-7 text-white" />}
                  {statusMap[id as RoomId] === 'red' && <X className="w-7 h-7 text-white" />}
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      statusMap[id as RoomId] === 'green' ? 'w-full bg-[#6BB85C]' :
                        statusMap[id as RoomId] === 'red' ? 'w-full bg-red-500' :
                          'w-0'
                    }`}
                  />
                </div>

                {/* Status Text */}
                <p className={`text-center mt-4 font-medium ${
                  statusMap[id as RoomId] === 'green'
                    ? 'text-[#6BB85C]'
                    : statusMap[id as RoomId] === 'red'
                      ? 'text-red-500'
                      : 'text-gray-400'
                }`}>
                  {statusMap[id as RoomId] === 'green'
                    ? t.available
                    : statusMap[id as RoomId] === 'red'
                      ? t.unavailable
                      : '—'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Last Update */}
        <div className="text-center text-base text-[#963E56]/70">
          {t.lastUpdate}: {lastUpdate.toLocaleTimeString(language === 'nl' ? 'nl-NL' : 'ar-SA')}
        </div>
      </div>

      {/* Language Switcher */}
      <div className="fixed bottom-4 left-4 flex gap-1 p-1 rounded-lg shadow-lg border border-[#963E56]/10 z-50 bg-white">
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
    </div>
  );
}