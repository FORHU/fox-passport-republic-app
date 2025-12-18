"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation"; 
import { 
  Menu, X, ChevronDown, 
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
  // ✅ NEW STATE: Track which option is selected
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  if (!isOpen) return null;

  const options = [
    { label: "Home", icon: Home, color: "text-blue-500" },
    { label: "Experience", icon: Tent, color: "text-orange-500" }, 
    { label: "Service", icon: ConciergeBell, color: "text-gray-700" }, 
  ];

  const handleNext = () => {
    if (selectedOption) {
      onOptionClick(); // Only proceed if an option is selected
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8 pb-24 flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">
          What would you like to host?
        </h2>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {options.map((opt, idx) => {
            const Icon = opt.icon;
            const isSelected = selectedOption === opt.label;

            return (
              <button 
                key={idx}
                onClick={() => setSelectedOption(opt.label)} 
                className={`group flex flex-col items-center justify-center p-8 border-2 rounded-2xl transition-all duration-300 bg-white
                  ${isSelected 
                    ? "border-pink-600 bg-pink-50 shadow-lg scale-105" 
                    : "border-gray-100 hover:border-gray-300 hover:shadow-xl"
                  }
                `}
              >
                <div className="mb-6 transform transition-transform duration-300 group-hover:scale-110">
                  <Icon size={64} className={opt.color} strokeWidth={1} /> 
                </div>
                <span className={`text-lg font-bold ${isSelected ? "text-pink-600" : "text-gray-800"}`}>
                  {opt.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* ✅ THE NEXT BUTTON (Now Logic-Aware) */}
        <button 
          onClick={handleNext} 
          disabled={!selectedOption} 
          className={`absolute bottom-8 right-8 px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2
            ${selectedOption 
              ? "bg-pink-600 text-white hover:bg-pink-700 hover:scale-105 shadow-md cursor-pointer" 
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          Next
          <ArrowRight size={18} />
        </button>

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

  // --- LOGIC: HOST MODAL NEXT CLICK ---
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
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 px-4 md:px-10 py-3 md:py-4 ${styles.navBgClass}`}>
        <div className="flex items-center justify-between">
          
          {/* LOGO */}
          <div className="flex-shrink-0 h-[56px] md:h-[80px] flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logofoxpassport.png" 
                alt="Logo" 
                width={80} 
                height={80} 
                className="h-14 md:h-20 w-auto object-contain" 
                priority 
              />
              <span className={`hidden md:block text-2xl font-bold tracking-tight transition-colors duration-300 ${styles.logoTextClass}`}>
                Fox<span className="text-pink-500">Passport</span>
              </span>
            </Link>
          </div>

          {/* DESKTOP RIGHT */}
          <div className="hidden md:flex flex-shrink-0 h-[80px] items-center gap-6">
            <div className={`flex items-center gap-6 text-sm font-bold transition-colors duration-300 ${styles.mainLinkClass}`}>
              <button 
                onClick={() => setHostModalOpen(true)}
                className={`hover:underline decoration-2 underline-offset-8 outline-none ${styles.textColorClass}`}
              >
                Become a Foxer
              </button>
              <Link href="#">Write a Review</Link>
              <Link href="#">For Businesses</Link>
            </div>
            
            <div className="flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  <button 
                    onClick={openLogin} 
                    className={`px-5 py-2.5 text-sm font-bold rounded-full border-2 transition-all duration-300 ${
                      isScrolled 
                        ? "border-gray-800 text-gray-800 hover:bg-gray-100" 
                        : "border-white/80 text-white hover:bg-white/20"
                    }`}
                  >
                    Log In
                  </button>
                  <button 
                    onClick={openSignup} 
                    className="px-5 py-2.5 text-sm font-bold bg-[#E31C79] border-2 border-[#E31C79] text-white rounded-full hover:bg-pink-700 shadow-md transition-all duration-300"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleUserDashboardClick}
                  className="px-5 py-2.5 text-sm font-bold bg-[#E31C79] text-white rounded-full hover:bg-pink-700 shadow-md transition-all duration-300 flex items-center gap-2"
                >
                  Dashboard
                </button>
              )}
            </div>
          </div>

          {/* MOBILE TOGGLE */}
          <div className="flex md:hidden flex-shrink-0 h-[56px] items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className={`p-2 rounded-full transition-all duration-300 ${
                isScrolled 
                  ? "text-gray-800 bg-gray-100 hover:bg-gray-200" 
                  : "text-white bg-white/20 hover:bg-white/30"
              }`}
            >
               {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="absolute top-[100%] left-0 w-full bg-pink-950/80 backdrop-blur-xl shadow-xl border-t border-pink-500/20 flex flex-col p-5 animate-in slide-in-from-top-2 md:hidden max-h-[80vh] overflow-y-auto">
            <div className="mb-4">
              <button 
                onClick={() => { setMobileMenuOpen(false); setHostModalOpen(true); }}
                className="flex items-center gap-2 mb-2 text-pink-500 font-bold"
              >
                  Become a Foxer
              </button>
            </div>
            <hr className="border-pink-500/20 my-4" />
            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { openLogin(); setMobileMenuOpen(false); }} className="w-full py-3 rounded-lg border border-pink-500/30 text-white text-xs font-bold hover:bg-pink-500/10">Log In</button>
                <button onClick={() => { openSignup(); setMobileMenuOpen(false); }} className="w-full py-3 rounded-lg bg-[#E31C79] text-white text-xs font-bold hover:bg-pink-700">Sign Up</button>
              </div>
            ) : (
               <button 
                 onClick={() => { setMobileMenuOpen(false); handleUserDashboardClick(); }} 
                 className="w-full py-3 rounded-lg bg-[#E31C79] text-white text-xs font-bold hover:bg-pink-700"
               >
                 Go to Dashboard
               </button>
            )}
          </div>
        )}
      </nav>

      {/* --- MODALS --- */}
      <AuthModal />
      <HostModal 
        isOpen={isHostModalOpen} 
        onClose={() => setHostModalOpen(false)} 
        onOptionClick={handleHostOptionClick} 
      />
    </>
  );
}

export default function Navbar() {
  return <Suspense fallback={<div className="h-[80px]" />}><NavbarContent /></Suspense>;
}