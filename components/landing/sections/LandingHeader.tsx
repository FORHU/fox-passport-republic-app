"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";
import UserMenuButton from "@/components/users/UserMenuButton";

interface LandingHeaderProps {
  onSignIn: () => void;
}

export default function LandingHeader({ onSignIn }: LandingHeaderProps) {
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="fixed top-6 left-0 right-0 z-50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4">
        <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer relative">
            <div className="flex h-12 w-12 items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
              <Image 
                src="/foxonlylogo.png" 
                alt="FoxPassport Logo" 
                width={48} 
                height={48} 
                className="object-contain"
              />
            </div>
            <div className="relative">
              <h2 className="text-2xl font-display font-bold tracking-tight text-white group-hover:text-[#ccff00] transition-colors">
                FoxPassport
              </h2>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#ccff00] group-hover:w-full transition-all duration-300"></span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
            <a
              className="px-6 py-2.5 rounded-full text-sm font-bold text-black bg-[#ccff00] hover:bg-[#b8e600] hover:shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all transform hover:-translate-y-0.5"
              href="#"
            >
              Explore
            </a>
            <Link
              href="/foxer/dashboard"
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
          <div className="flex items-center gap-4">
            <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all hover:rotate-12">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>

            {isAuthenticated ? (
              // Logged in - Show UserMenuButton (Airbnb style)
              <div className="hidden sm:block">
                <UserMenuButton />
              </div>
            ) : (
              // Not logged in - Show Sign In button
              <button
                onClick={onSignIn}
                className="hidden sm:flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-6 py-2.5 text-sm font-bold text-white hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 group overflow-hidden relative"
              >
                <span className="relative z-10">Sign In</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
              </button>
            )}

            <button className="flex sm:hidden h-10 w-10 items-center justify-center rounded-full bg-white text-black">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
