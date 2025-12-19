"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation"; 
import { 
  Menu, X, 
  Home, Tent, ConciergeBell,
  ArrowRight 
} from "lucide-react"; 

import AuthModal from "./AuthModal";
import { useNavbar } from "@/src/hooks/useNavbar"; 
import { useAuthStore } from "@/src/store/useAuthStore";

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
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
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
    isScrolled, mobileMenuOpen, setMobileMenuOpen, 
    openLogin, openSignup, styles 
  } = useNavbar();

  const handleHostOptionClick = () => {
    setHostModalOpen(false);
    if (isAuthenticated) {
      router.push("/foxerDashboard"); 
    } else {
      openLogin(); 
    }
  };

  const handleUserDashboardClick = () => {
     router.push("/authenticatedUser");
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ease-in-out ${styles.navBgClass}`}>
        
        {/* Container for content alignment */}
        <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
          
          <div className="flex flex-row items-center justify-between gap-3 md:gap-0 py-3 md:py-4">
            
            {/* LOGO */}
            <div className="flex-shrink-0 cursor-pointer">
              <Link href="/" className="flex items-center gap-2">
                <Image 
                  src="/logofoxpassport.png" 
                  alt="Logo" 
                  width={80} 
                  height={80} 
                  className="h-10 md:h-20 w-auto object-contain" 
                  priority 
                />
                <span className={`hidden md:block text-2xl font-bold tracking-tight transition-all duration-500 ease-in-out ${styles.logoTextClass}`}>
                  Fox<span className="text-pink-500">Passport</span>
                </span>
              </Link>
            </div>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex flex-row items-center gap-6">
              <div className="flex items-center gap-8 text-[15px] font-bold tracking-tight">
                <button 
                  onClick={() => setHostModalOpen(true)}
                  className={`hover:underline decoration-2 underline-offset-8 outline-none transition-all duration-500 ease-in-out ${styles.mainLinkClass}`}
                >
                  Become a Foxer
                </button>
                <Link href="#" className={`hover:underline decoration-2 underline-offset-8 transition-all duration-500 ease-in-out ${styles.mainLinkClass}`}>
                  Write a Review
                </Link>
                <Link href="#" className={`hover:underline decoration-2 underline-offset-8 transition-all duration-500 ease-in-out ${styles.mainLinkClass}`}>
                  For Businesses
                </Link>
              </div>
              
              <div className="flex items-center gap-3">
                {!isAuthenticated ? (
                  <>
                    <button 
                      onClick={openLogin} 
                      className={`px-5 py-2.5 text-[15px] font-bold tracking-tight rounded-full border-2 transition-all duration-500 ease-in-out ${styles.loginButtonClass}`}
                    >
                      Log In
                    </button>
                    <button 
                      onClick={openSignup} 
                      className="px-5 py-2.5 text-[15px] font-bold tracking-tight bg-[#E31C79] border-2 border-[#E31C79] text-white rounded-full hover:bg-pink-700 shadow-md transition-all duration-500 ease-in-out"
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleUserDashboardClick}
                    className="px-5 py-2.5 text-[15px] font-bold tracking-tight bg-[#E31C79] text-white rounded-full hover:bg-pink-700 shadow-md transition-all duration-500 ease-in-out flex items-center gap-2"
                  >
                    Dashboard
                  </button>
                )}
              </div>
            </div>

            {/* MOBILE TOGGLE */}
            <div className="flex md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className={`p-2 transition-colors duration-300 bg-transparent border-none outline-none ${
                  isScrolled || mobileMenuOpen
                    ? "text-gray-800"  
                    : "text-white drop-shadow-md"      
                }`}
                aria-label="Toggle Menu"
              >
                 {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>

          </div>
        </div>

        {/* --- MOBILE MENU CONTENT (Compact Dropdown Style) --- */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 md:hidden z-[99] animate-in slide-in-from-top-1 duration-200">
            <div className="px-4 py-3">
              {/* Navigation Links */}
              <div className="space-y-1">
                <button 
                  onClick={() => { setMobileMenuOpen(false); setHostModalOpen(true); }}
                  className="w-full text-left text-gray-800 font-semibold text-sm hover:text-pink-600 hover:bg-pink-50 transition-colors py-3 px-3 rounded-lg"
                >
                  Become a Foxer
                </button>
                
                <Link 
                  href="#" 
                  className="block text-gray-600 font-medium text-sm hover:text-pink-600 hover:bg-pink-50 transition-colors py-3 px-3 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Write a Review
                </Link>
                
                <Link 
                  href="#" 
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
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setMobileMenuOpen(false); handleUserDashboardClick(); }} 
                    className="flex-1 py-2.5 rounded-lg bg-[#E31C79] text-white font-semibold hover:bg-pink-700 shadow-sm transition-all text-sm"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); useAuthStore.getState().logout(); }} 
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