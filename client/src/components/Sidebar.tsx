import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, LogOut, Share2, Home, User, Languages } from "lucide-react";
import { Link } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [_, setLocation] = useLocation();
  const [profileName, setProfileName] = useState("");
  const [language, setLanguage] = useState<'nl' | 'ar'>('nl');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user?.email) {
        switch (user.email) {
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

  const handleLogout = () => {
    signOut(auth)
      .then(() => setLocation('/login'))
      .catch(console.error);
  };

  return (
    <div className={`
      fixed top-0 left-0 h-full bg-white shadow-xl transition-all duration-300 z-50 flex flex-col border-r border-[#963E56]/10
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

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Logo Section */}
        {isOpen && (
          <div className="rounded-lg border border-[#963E56]/10 bg-white p-3 shadow-sm">
            <img 
              src="/static/moskee.png"
              alt="MEFEN Logo" 
              className="w-32 h-32 mx-auto object-contain" 
            />
          </div>
        )}

        {/* Profile Section */}
        <div className={`
          rounded-lg border border-[#963E56]/10 bg-white p-3 shadow-sm
          ${isOpen ? 'block' : 'hidden'}
        `}>
          <div className="flex items-center gap-3">
            <div className="bg-[#963E56]/10 p-2 rounded-full">
              <User className="h-5 w-5 text-[#963E56]" />
            </div>
            <span className="font-medium text-[#963E56]">
              {profileName}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <Link href="/">
            <a className={`
              flex items-center gap-3 p-2 rounded-lg text-[#963E56] hover:bg-[#963E56]/5 transition-colors
              ${isOpen ? 'justify-start px-4' : 'justify-center'}
            `}>
              <Home className="h-5 w-5 shrink-0" />
              <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                Dashboard
              </span>
            </a>
          </Link>
          <Link href="/delen">
            <a className={`
              flex items-center gap-3 p-2 rounded-lg text-[#963E56] hover:bg-[#963E56]/5 transition-colors
              ${isOpen ? 'justify-start px-4' : 'justify-center'}
            `}>
              <Share2 className="h-5 w-5 shrink-0" />
              <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                Delen
              </span>
            </a>
          </Link>

          {/* Language Selector */}
          <button
            onClick={() => setLanguage(language === 'nl' ? 'ar' : 'nl')}
            className={`
              w-full flex items-center gap-3 p-2 rounded-lg text-[#963E56] hover:bg-[#963E56]/5 transition-colors
              ${isOpen ? 'justify-start px-4' : 'justify-center'}
            `}
          >
            <Languages className="h-5 w-5 shrink-0" />
            <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
              {language === 'nl' ? 'العربية' : 'Nederlands'}
            </span>
          </button>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4">
        <Button
          variant="ghost"
          className={`
            w-full flex items-center gap-2 text-red-500 hover:text-white hover:bg-red-500 transition-all duration-300
            ${isOpen ? 'justify-start px-4' : 'justify-center'}
          `}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
            {language === 'nl' ? 'Afmelden' : 'تسجيل خروج'}
          </span>
        </Button>
      </div>
    </div>
  );
}