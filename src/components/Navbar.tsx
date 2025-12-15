"use client"; 
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Building2, UtensilsCrossed, Camera } from "lucide-react"; 
import AuthModal from "./AuthModal";
import { useAuthStore } from "../store/useAuthStore";
import SearchBar from "./SearchBar";

function NavbarContent() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openLogin, openSignup } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Styles
  const navBgClass = isScrolled || mobileMenuOpen
    ? "bg-white shadow-md border-b border-gray-100"
    : "bg-transparent bg-gradient-to-b from-black/50 to-transparent";

  // Text colors: Dark on white bg, White on transparent bg
  const textColorClass = isScrolled || mobileMenuOpen ? "text-gray-600 hover:text-black" : "text-gray-200 hover:text-white";
  const logoTextClass = isScrolled || mobileMenuOpen ? "text-gray-900" : "text-white";
  const mainLinkClass = isScrolled || mobileMenuOpen ? "text-gray-900 hover:text-gray-600" : "text-white hover:text-gray-200";

  return (
    <>
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 px-4 md:px-10 py-3 md:py-4 ${navBgClass}`}>
        
        <div className="flex items-start justify-between gap-2 md:gap-0">
          
          {/* LEFT: LOGO */}
          <div className="flex-shrink-0 h-[48px] md:h-[66px] flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/foxpasslogo.png" alt="Logo" width={32} height={32} className="h-8 md:h-10 w-auto object-contain" priority />
              <span className={`hidden md:block text-2xl font-bold tracking-tight ${logoTextClass}`}>
                Fox<span className="text-pink-500">Passport</span>
              </span>
            </Link>
          </div>

          {/* CENTER: SEARCH BAR + SUB-LINKS */}
          <div className="flex flex-1 flex-col items-center justify-center px-2 md:px-0">
             {/* Search Bar */}
             <div className="w-full max-w-[850px] transform scale-100 md:scale-95 origin-center md:origin-top">
                <SearchBar isHero={false} /> 
             </div>
             
             {/* Desktop Sub-Nav (Venues, Catering...) */}
             <div className={`hidden md:flex gap-8 text-sm font-bold mt-2 transition-colors duration-300 ${textColorClass}`}>
                <Link href="#" className="hover:underline decoration-2 underline-offset-8">Venues</Link>
                <Link href="#" className="hover:underline decoration-2 underline-offset-8">Catering</Link>
                <Link href="#" className="hover:underline decoration-2 underline-offset-8">Photography</Link>
             </div>
          </div>

          {/* RIGHT: DESKTOP ACTIONS (Restored Links) */}
          <div className="hidden md:flex flex-shrink-0 h-[66px] items-center gap-6">
            
            {/* RESTORED LINKS */}
            <div className={`flex items-center gap-6 text-sm font-bold transition-colors duration-300 ${mainLinkClass}`}>
              <Link href="#">Become a Foxer</Link>
              <Link href="#">Write a Review</Link>
              <Link href="#">For Businesses</Link>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button 
                onClick={openLogin} 
                className={`px-5 py-2.5 text-sm font-bold rounded-full border-2 transition-all ${isScrolled ? 'border-gray-900 text-gray-900 hover:bg-gray-100' : 'border-white/80 text-white hover:bg-white/20'}`}
              >
                Log In
              </button>
              <button 
                onClick={openSignup} 
                className="px-5 py-2.5 text-sm font-bold bg-[#E31C79] border-2 border-[#E31C79] text-white rounded-full hover:bg-pink-700 shadow-md"
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <div className="flex md:hidden flex-shrink-0 h-[48px] items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-full ${isScrolled || mobileMenuOpen ? 'text-gray-900 bg-gray-100' : 'text-white bg-white/20'}`}
            >
               {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* --- MOBILE MENU DROPDOWN --- */}
        {mobileMenuOpen && (
          <div className="absolute top-[100%] left-0 w-full bg-white shadow-xl border-t border-gray-100 flex flex-col p-5 animate-in slide-in-from-top-2 md:hidden">
            <div className="flex flex-col gap-2 text-sm font-medium text-gray-700 mb-4">
              <Link href="#" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <Building2 className="w-5 h-5 text-pink-600" />
                <span className="text-gray-900 font-bold">Venues</span>
              </Link>
              <Link href="#" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <UtensilsCrossed className="w-5 h-5 text-pink-600" />
                <span className="text-gray-900 font-bold">Catering</span>
              </Link>
              <Link href="#" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <Camera className="w-5 h-5 text-pink-600" />
                <span className="text-gray-900 font-bold">Photography</span>
              </Link>
            </div>
            
            {/* Added Mobile Versions of Restored Links */}
            <div className="flex flex-col gap-3 py-2 text-sm font-semibold text-gray-600 border-t border-gray-100 pt-4">
               <Link href="#" onClick={() => setMobileMenuOpen(false)}>Become a Foxer</Link>
               <Link href="#" onClick={() => setMobileMenuOpen(false)}>Write a Review</Link>
               <Link href="#" onClick={() => setMobileMenuOpen(false)}>For Businesses</Link>
            </div>

            <hr className="border-gray-100 my-4" />
            
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { openLogin(); setMobileMenuOpen(false); }} className="w-full py-3 rounded-lg border border-gray-300 text-gray-900 text-xs font-bold hover:bg-gray-50">Log In</button>
              <button onClick={() => { openSignup(); setMobileMenuOpen(false); }} className="w-full py-3 rounded-lg bg-[#E31C79] text-white text-xs font-bold hover:bg-pink-700">Sign Up</button>
            </div>
          </div>
        )}

      </nav>
      <AuthModal />
    </>
  );
}

export default function Navbar() {
  return <Suspense fallback={<div className="h-[80px]" />}><NavbarContent /></Suspense>;
}