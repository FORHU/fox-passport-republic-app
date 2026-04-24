"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { useRouter } from "next/navigation";
import {
  X,
  Home, Tent, ConciergeBell,
  ArrowRight
} from "lucide-react";

import AuthModal from "@/components/landing/AuthModal";
import { useNavbar } from "@/hooks/ui/useNavbar";
import { useAuthStore } from "@/store/useAuthStore";
import UserMenuButton from "@/components/users/UserMenuButton";
import { clearAuthCookies } from "@/lib/server/auth-actions";

// --- HOST MODAL (Internal Component) ---
interface HostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOptionClick: () => void;
}

const HostModal = ({ isOpen, onClose, onOptionClick }: HostModalProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  if (!isOpen) return null;

  const options = [
    { label: "Home", icon: Home, color: "text-blue-500" },
    { label: "Experience", icon: Tent, color: "text-orange-500" }, 
    { label: "Service", icon: ConciergeBell, color: "text-gray-700" }, 
  ];

  const handleNext = () => {
    if (selectedOption) {
      onOptionClick(); 
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-xl md:hidden flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in slide-in-from-top-10 duration-300">
      <div className="relative w-full max-w-sm md:max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header with X button properly positioned */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 md:px-6 md:pt-5">
          <div className="w-8" /> {/* Spacer for centering */}
          <h2 className="text-base md:text-xl font-bold text-center text-gray-800 flex-1">
            What would you like to host?
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 px-4 py-4 md:px-6 md:py-6">
          {options.map((opt, idx) => {
            const Icon = opt.icon;
            const isSelected = selectedOption === opt.label;

            return (
              <button 
                key={idx}
                onClick={() => setSelectedOption(opt.label)} 
                className={`group flex flex-col items-center justify-center 
                  py-3 px-2 md:py-6 md:px-4 border-2 rounded-xl transition-all duration-300 bg-white
                  ${isSelected 
                    ? "border-pink-600 bg-pink-50 shadow-md scale-105" 
                    : "border-gray-100 hover:border-gray-300 hover:shadow-lg"
                  }
                `}
              >
                <div className="mb-2 md:mb-4 transform transition-transform duration-300 group-hover:scale-110">
                  <Icon className={`${opt.color} w-6 h-6 md:w-12 md:h-12`} strokeWidth={1.5} /> 
                </div>
                <span className={`text-[11px] md:text-sm font-bold ${isSelected ? "text-pink-600" : "text-gray-800"}`}>
                  {opt.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Footer with Next button */}
        <div className="flex justify-end px-4 pb-4 md:px-6 md:pb-5">
          <button 
            onClick={handleNext} 
            disabled={!selectedOption} 
            className={`px-5 py-2 md:px-6 md:py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 text-sm
              ${selectedOption 
                ? "bg-pink-600 text-white hover:bg-pink-700 hover:scale-105 shadow-md cursor-pointer" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            Next
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN NAVBAR CONTENT ---

function NavbarContent() {
  const router = useRouter();
  const [isHostModalOpen, setHostModalOpen] = useState(false);
  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  const {
    mobileMenuOpen, setMobileMenuOpen,
    openLogin, openSignup
  } = useNavbar();

  const handleHostOptionClick = () => {
    setHostModalOpen(false);
    if (isAuthenticated) {
      router.push("/creator-dashboard");
    } else {
      openLogin();
    }
  };

  const handleWriteReview = () => {
    if (isAuthenticated) {
      router.push("/reviews/select");
    } else {
      openLogin();
    }
  };

  const handleLogout = async () => {
    // Clear cookies on server
    await clearAuthCookies();
    // Clear client store
    useAuthStore.getState().logout();
    // Close menu and redirect
    setMobileMenuOpen(false);
    router.push("/");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-110 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4">
          <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">

            {/* LOGO */}
            <BrandLogo />

            {/* DESKTOP MENU */}
            <nav className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
              <a href="#" className="px-6 py-2.5 rounded-full text-sm font-bold text-black bg-accent hover:bg-accent/90 hover:shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all transform hover:-translate-y-0.5">
                Explore
              </a>
              <Link href="/creator-dashboard" className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105">
                Host
              </Link>
              <Link href="/passport" className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105">
                Community
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all hover:rotate-12">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </button>
              {!isAuthenticated ? (
                <button
                  onClick={openLogin}
                  className="hidden sm:flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-6 py-2.5 text-sm font-bold text-white hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 group overflow-hidden relative"
                >
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                </button>
              ) : (
                <UserMenuButton />
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex sm:hidden h-10 w-10 items-center justify-center rounded-full bg-white text-black"
              >
                <span className="material-symbols-outlined">{mobileMenuOpen ? "close" : "menu"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* --- MOBILE MENU CONTENT (Compact Dropdown Style) --- */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 md:hidden z-99 animate-in slide-in-from-top-1 duration-200">
            <div className="px-4 py-3">
              {/* Navigation Links */}
              <div className="space-y-1">
                <button 
                  onClick={() => { setMobileMenuOpen(false); setHostModalOpen(true); }}
                  className="w-full text-left text-gray-800 font-semibold text-sm hover:text-pink-600 hover:bg-pink-50 transition-colors py-3 px-3 rounded-lg"
                >
                  Become a Foxer
                </button>
                
                <button
                  onClick={() => { handleWriteReview(); setMobileMenuOpen(false); }}
                  className="w-full text-left text-gray-600 font-medium text-sm hover:text-pink-600 hover:bg-pink-50 transition-colors py-3 px-3 rounded-lg"
                >
                  Write a Review
                </button>
                
                <Link 
                  href="/business" 
                  className="block text-gray-600 font-medium text-sm hover:text-pink-600 hover:bg-pink-50 transition-colors py-3 px-3 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  For Businesses
                </Link>
              </div>
              
              {/* Divider */}
              <div className="my-3 border-t border-gray-100" />
              
              {/* Auth Buttons */}
              {!isAuthenticated ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => { openLogin(); setMobileMenuOpen(false); }} 
                    className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all text-sm"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => { openSignup(); setMobileMenuOpen(false); }} 
                    className="flex-1 py-2.5 rounded-lg bg-[#E31C79] text-white font-semibold hover:bg-pink-700 shadow-sm transition-all text-sm"
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <div className="fixed inset-0 z-99 backdrop-blur-sm bg-black/50 md:hidden animate-in fade-in duration-300" onClick={() => setMobileMenuOpen(false)}></div>
              )}
              {isAuthenticated && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setMobileMenuOpen(false); router.push("/user"); }} 
                    className="flex-1 py-2.5 rounded-lg bg-[#E31C79] text-white font-semibold hover:bg-pink-700 shadow-sm transition-all text-sm"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all text-sm"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <HostModal 
        isOpen={isHostModalOpen} 
        onClose={() => setHostModalOpen(false)} 
        onOptionClick={handleHostOptionClick} 
      />
      <AuthModal />
    </>
  );
}

export default function Navbar() {
  return <Suspense fallback={<div className="h-[80px]" />}><NavbarContent /></Suspense>;
}