"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
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
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 pt-2 sm:pt-6 transition-all duration-300"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0, 0, 0.2, 1] }}
      >
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="glass-panel rounded-full px-4 sm:px-6 h-12 sm:h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group cursor-pointer relative">
              <div className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                <Image
                  src="/foxonlylogo.png"
                  alt="FoxPassport Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div className="relative">
                <h2 className="text-base sm:text-2xl font-display font-bold tracking-tight text-white group-hover:text-[#ccff00] transition-colors">
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
              {/* Desktop-only: Sign In */}
              {!isAuthenticated && (
                <button
                  onClick={onSignIn}
                  className="hidden md:flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-6 py-2.5 text-sm font-bold text-white hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 group overflow-hidden relative"
                >
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                </button>
              )}
              <UserMenuButton onSignIn={onSignIn} />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Bottom Navigation Bar — full-width tab bar */}
      <motion.div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.15, ease: [0, 0, 0.2, 1] }}
      >
        <nav className="bg-black/95 backdrop-blur-2xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.6)] flex items-center">
          {/* Explore */}
          <a
            href="#"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-3 text-[#ccff00]"
          >
            <span className="material-symbols-outlined text-[22px]">explore</span>
            <span className="text-[9px] font-bold tracking-wide">Explore</span>
          </a>

          {/* Foxers */}
          <Link
            href="/search"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-3 text-white/40 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">group</span>
            <span className="text-[9px] font-bold tracking-wide">Foxers</span>
          </Link>

          {/* Community */}
          <Link
            href="/passport"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-3 text-white/40 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">diversity_3</span>
            <span className="text-[9px] font-bold tracking-wide">Community</span>
          </Link>

        </nav>
      </motion.div>
    </>
  );
}
