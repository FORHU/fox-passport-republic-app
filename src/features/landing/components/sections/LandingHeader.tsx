"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import UserMenuButton from "@/features/user/components/UserMenuButton";

interface LandingHeaderProps {
  onSignIn: () => void;
}

export default function LandingHeader({ onSignIn }: LandingHeaderProps) {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 pt-3 sm:pt-6 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="glass-panel rounded-full px-4 sm:px-6 h-14 sm:h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group cursor-pointer relative">
              <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                <Image 
                  src="/foxonlylogo.png" 
                  alt="FoxPassport Logo" 
                  width={48} 
                  height={48} 
                  className="object-contain"
                />
              </div>
              <div className="relative">
                <h2 className="text-lg sm:text-2xl font-display font-bold tracking-tight text-white group-hover:text-[#ccff00] transition-colors">
                  FoxPassport
                </h2>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#ccff00] group-hover:w-full transition-all duration-300"></span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
              <a
                className="px-6 py-2.5 rounded-full text-sm font-bold text-black bg-[#ccff00] hover:bg-[#b8e600] hover:shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all transform hover:-translate-y-0.5"
                href="#"
              >
                Explore
              </a>
              <Link
            href="/search"
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105"
              >
                Foxers
              </Link>
              <Link
                href="/passport"
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105"
              >
                Community
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/search"
                className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all hover:rotate-12"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">search</span>
              </Link>

              {!isAuthenticated && (
                <button
                  onClick={onSignIn}
                  className="hidden sm:flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-6 py-2.5 text-sm font-bold text-white hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 group overflow-hidden relative"
                >
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                </button>
              )}

              <UserMenuButton onSignIn={onSignIn} />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Matching Top Header Width) */}
      <div className="md:hidden fixed bottom-3 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <nav className="glass-panel bg-black/90 backdrop-blur-2xl rounded-full h-14 px-6 border border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.8)] flex items-center justify-around">
            <a
              href="#"
              title="Explore"
              className="p-2.5 rounded-full text-black bg-[#ccff00] hover:bg-[#b8e600] transition-all flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.4)]"
            >
              <span className="material-symbols-outlined text-[20px]">explore</span>
            </a>
            <Link
              href="/search"
              title="Foxers"
              className="p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">group</span>
            </Link>
            <Link
              href="/passport"
              title="Community"
              className="p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">diversity_3</span>
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
