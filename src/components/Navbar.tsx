"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react"; 
import AuthModal from "./AuthModal";
import { useNavbar } from "../hooks/useNavbar";
import { NAV_MENU } from "../config/navMenuData"; 

function NavbarContent() {
  const { 
    isScrolled, mobileMenuOpen, setMobileMenuOpen, 
    activeDropdown, setActiveDropdown, 
    openLogin, openSignup, styles 
  } = useNavbar();

  // Helper Component (Internal)
  const NavItemWithDropdown = ({ title, id, items, alignRight = false }: { title: string, id: string, items: any[], alignRight?: boolean }) => (
    <div 
      className="relative group h-full flex items-center"
      onMouseEnter={() => setActiveDropdown(id)}
      onMouseLeave={() => setActiveDropdown(null)}
    >
      <button className={`flex items-center gap-1 hover:underline decoration-2 underline-offset-8 outline-none ${styles.textColorClass}`}>
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === id ? "rotate-180" : ""}`} />
      </button>

      {/* DROPDOWN MENU */}
      <div className={`absolute top-full ${alignRight ? "right-0 origin-top-right" : "left-0 origin-top-left"} pt-4 w-64 transition-all duration-200 ${activeDropdown === id ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2">
          {items.map((item, idx) => {
            const Icon = item.icon; 
            return (
              <Link key={idx} href={item.href} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-pink-600 font-medium transition-colors">
                <div className="p-2 bg-gray-100 rounded-full text-gray-500 group-hover:text-pink-600 group-hover:bg-pink-50 transition-colors">
                   <Icon className="w-4 h-4" />
                </div>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 px-4 md:px-10 py-3 md:py-4 ${styles.navBgClass}`}>
        <div className="flex items-center justify-between">
          
          {/* LOGO */}
          <div className="flex-shrink-0 h-[48px] md:h-[66px] flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/foxpasslogo.png" alt="Logo" width={32} height={32} className="h-8 md:h-10 w-auto object-contain" priority />
              <span className={`hidden md:block text-2xl font-bold tracking-tight text-gray-200 ${styles.logoTextClass}`}>
                Fox<span className="text-pink-500">Passport</span>
              </span>
            </Link>
          </div>

          {/* DESKTOP RIGHT */}
          <div className="hidden md:flex flex-shrink-0 h-[66px] items-center gap-6">
            <div className={`flex items-center gap-6 text-sm font-bold transition-colors duration-300 ${styles.mainLinkClass}`}>
              <NavItemWithDropdown title="Become a Foxer" id="business" items={NAV_MENU.business} alignRight={true} />
              <Link href="#">Write a Review</Link>
              <Link href="#">For Businesses</Link>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={openLogin} className="px-5 py-2.5 text-sm font-bold rounded-full border-2 border-white/80 text-white hover:bg-white/20 transition-all">Log In</button>
              <button onClick={openSignup} className="px-5 py-2.5 text-sm font-bold bg-[#E31C79] border-2 border-[#E31C79] text-white rounded-full hover:bg-pink-700 shadow-md">Sign Up</button>
            </div>
          </div>

          {/* MOBILE TOGGLE */}
          <div className="flex md:hidden flex-shrink-0 h-[48px] items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-full text-white bg-white/20">
               {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="absolute top-[100%] left-0 w-full bg-pink-950/80 backdrop-blur-xl shadow-xl border-t border-pink-500/20 flex flex-col p-5 animate-in slide-in-from-top-2 md:hidden max-h-[80vh] overflow-y-auto">
            <MobileSection title="Venues" items={NAV_MENU.venues} />
            <MobileSection title="Catering" items={NAV_MENU.catering} />
            <MobileSection title="Photography" items={NAV_MENU.photography} />
            <MobileSection title="Become a Foxer" items={NAV_MENU.business} />
    
            <hr className="border-pink-500/20 my-4" />
            <div className="flex flex-col gap-3 py-2 text-sm font-semibold text-gray-300">
               <Link href="#" onClick={() => setMobileMenuOpen(false)}>Write a Review</Link>
               <Link href="#" onClick={() => setMobileMenuOpen(false)}>For Businesses</Link>
            </div>
            <hr className="border-pink-500/20 my-4" />
            <div className="grid grid-cols-2 gap-3">
               <button onClick={() => { openLogin(); setMobileMenuOpen(false); }} className="w-full py-3 rounded-lg border border-pink-500/30 text-white text-xs font-bold hover:bg-pink-500/10">Log In</button>
               <button onClick={() => { openSignup(); setMobileMenuOpen(false); }} className="w-full py-3 rounded-lg bg-[#E31C79] text-white text-xs font-bold hover:bg-pink-700">Sign Up</button>
            </div>
          </div>
        )}
      </nav>
      <AuthModal />
    </>
  );
}

// Mobile Section for dark theme
const MobileSection = ({ title, items }: any) => {
  const SectionIcon = items[0].icon; 

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2 text-pink-500 font-bold">
          <SectionIcon className="w-5 h-5" /> {title}
      </div>
      <div className="pl-7 flex flex-col gap-2">
          {items.map((i: any, idx: number) => {
             const ItemIcon = i.icon;
             return (
               <Link key={idx} href={i.href} className="flex items-center gap-2 text-white/70 text-sm font-medium hover:text-pink-500">
                 <ItemIcon className="w-4 h-4 text-white/50" />
                 {i.label}
               </Link>
             )
          })}
      </div>
    </div>
  );
};

export default function Navbar() {
  return <Suspense fallback={<div className="h-[80px]" />}><NavbarContent /></Suspense>;
}