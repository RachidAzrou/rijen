import { useState } from "react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, LogOut, Share2, Home } from "lucide-react";
import { Link } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [_, setLocation] = useLocation();

  const handleLogout = () => {
    signOut(auth)
      .then(() => setLocation('/login'))
      .catch(console.error);
  };

  return (
    <div className={`
      fixed top-0 left-0 h-full bg-white shadow-xl transition-all duration-300 z-50 flex flex-col
      ${isOpen ? 'w-64' : 'w-16'}
    `}>
      {/* Toggle Button - Originele styling */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-4 h-8 w-8 rounded-full bg-white shadow-md hover:bg-gray-100"
        onClick={onToggle}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {/* Logo Section - Vergroot */}
      <div className="pt-8 pb-4">
        {isOpen && (
          <div className="w-full p-2 flex justify-center items-center">
            <img
              src="/static/moskee.png"
              alt="MEFEN Logo"
              className="h-40 w-48 object-contain"
            />
          </div>
        )}
      </div>

      {/* Navigation Links - Verplaatst naar het midden */}
      <div className="flex-1 flex flex-col justify-start pt-20 p-4 space-y-2">
        <Link href="/">
          <a className={`
            flex items-center gap-3 p-3 rounded-lg text-[#963E56] hover:bg-[#963E56]/5 transition-colors
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
            flex items-center gap-3 p-3 rounded-lg text-[#963E56] hover:bg-[#963E56]/5 transition-colors
            ${isOpen ? 'justify-start px-4' : 'justify-center'}
          `}>
            <Share2 className="h-5 w-5 shrink-0" />
            <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
              Delen
            </span>
          </a>
        </Link>
      </div>

      {/* Logout Button */}
      <div className="p-4">
        <Button
          variant="ghost"
          className={`
            w-full flex items-center gap-3 p-3 rounded-lg text-[#963E56] hover:bg-[#963E56]/5 transition-colors
            ${isOpen ? 'justify-start px-4' : 'justify-center'}
          `}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
            Afmelden
          </span>
        </Button>
      </div>
    </div>
  );
}