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
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 z-50">
        <div className="flex items-center justify-around py-1">
          <Link href="/">
            <a className="flex flex-col items-center py-2 px-4">
              <Home className="h-5 w-5 text-[#963E56]" />
              <span className="text-[10px] mt-0.5 text-[#963E56]">Home</span>
            </a>
          </Link>
          <Link href="/delen">
            <a className="flex flex-col items-center py-2 px-4">
              <Share2 className="h-5 w-5 text-[#963E56]" />
              <span className="text-[10px] mt-0.5 text-[#963E56]">Delen</span>
            </a>
          </Link>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center py-2 px-4"
          >
            <LogOut className="h-5 w-5 text-[#963E56]" />
            <span className="text-[10px] mt-0.5 text-[#963E56]">Afmelden</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={`
        hidden md:flex fixed top-0 left-0 h-full bg-white/95 backdrop-blur-sm border-r border-gray-200 
        transition-all duration-300 z-40 flex-col
        ${isOpen ? 'w-56' : 'w-12'}
      `}>
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-4 h-6 w-6 rounded-full bg-white shadow-sm hover:bg-gray-100"
          onClick={onToggle}
        >
          {isOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>

        {/* Logo Section */}
        <div className="pt-6 pb-4">
          {isOpen && (
            <div className="w-full p-2 flex justify-center items-center">
              <img
                src="/static/Naamloos2.png"
                alt="MEFEN Logo"
                className="h-20 w-auto object-contain"
              />
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 flex flex-col justify-start pt-6 px-2 space-y-2">
          <Link href="/">
            <a className={`
              flex items-center gap-3 p-2 rounded-lg text-[#963E56] hover:bg-[#963E56]/5 transition-colors
              ${isOpen ? 'justify-start px-3' : 'justify-center'}
            `}>
              <Home className="h-4 w-4 shrink-0" />
              <span className={`transition-opacity duration-300 text-sm ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                Home
              </span>
            </a>
          </Link>

          <Link href="/delen">
            <a className={`
              flex items-center gap-3 p-2 rounded-lg text-[#963E56] hover:bg-[#963E56]/5 transition-colors
              ${isOpen ? 'justify-start px-3' : 'justify-center'}
            `}>
              <Share2 className="h-4 w-4 shrink-0" />
              <span className={`transition-opacity duration-300 text-sm ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                Delen
              </span>
            </a>
          </Link>
        </div>

        {/* Logout Button */}
        <div className="p-2">
          <Button
            variant="ghost"
            className={`
              w-full flex items-center gap-3 p-2 rounded-lg text-[#963E56] hover:bg-[#963E56]/5 transition-colors
              ${isOpen ? 'justify-start px-3' : 'justify-center'}
            `}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={`transition-opacity duration-300 text-sm ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
              Afmelden
            </span>
          </Button>
        </div>
      </div>
    </>
  );
}