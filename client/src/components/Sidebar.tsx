import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { doc, deleteDoc, getFirestore } from "firebase/firestore";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [_, setLocation] = useLocation();
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user?.email) {
        switch(user.email) {
          case 'beneden@mefen.be':
            setProfileName('Moskee +0');
            break;
          case 'boven@mefen.be':
            setProfileName('Moskee +1');
            break;
          case 'garage@mefen.be':
            setProfileName('Garage');
            break;
          default:
            setProfileName('Gebruiker');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const user = auth.currentUser;
      if (user?.email) {
        const db = getFirestore();
        const activeSessionRef = doc(db, "activeSessions", user.email);
        await deleteDoc(activeSessionRef);
      }
      await signOut(auth);
      setLocation('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const currentUrl = window.location.origin;
  const imamDashboardUrl = `${currentUrl}/imam`;

  return (
    <div className={`
      fixed top-0 left-0 h-full bg-white shadow-xl transition-all duration-300 z-50
      ${isOpen ? 'w-64' : 'w-16'}
    `}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-4 h-8 w-8 rounded-full bg-white shadow-md"
        onClick={onToggle}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      <div className="p-4 space-y-6">
        {/* Logo */}
        <div className={`flex justify-center transition-all duration-300 ${isOpen ? 'scale-100' : 'scale-0'}`}>
          <img src="/static/logo.png" alt="MEFEN Logo" className="h-16" />
        </div>

        {/* Profile Section */}
        <div className={`text-center transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          <h3 className="text-lg font-semibold text-[#963E56]">{profileName}</h3>
        </div>

        {/* QR Code */}
        <div className={`flex flex-col items-center transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <QRCodeSVG value={imamDashboardUrl} size={128} level="H" />
          </div>
          <p className="text-xs text-center mt-2 text-gray-600">Imam Dashboard</p>
        </div>

        {/* Logout Button */}
        <div className={`transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            variant="ghost"
            className="w-full flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Afmelden</span>
          </Button>
        </div>
      </div>
    </div>
  );
}