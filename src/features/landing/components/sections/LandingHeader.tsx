"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import UserMenuButton from "@/shared/components/layout/UserMenuButton";
import NotificationBell from "@/shared/components/layout/NotificationBell";
import MobileBottomNav from "@/shared/components/layout/MobileBottomNav";

interface LandingHeaderProps {
  /** Optional — defaults to the auth store's own `openLogin`, so a server
   * component can render this with no props at all (it can't pass a
   * closure across the server/client boundary the way a caller that's
   * already a client component can). */
  onSignIn?: () => void;
  /** When provided, renders an inline search input in place of the search icon. */
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
}

const NAV_TABS = [
  { label: "Explore", href: "/" },
  { label: "Foxers", href: "/search" },
  { label: "Map", href: "/venues/map" },
  { label: "Republic", href: "/republic" },
];

export default function LandingHeader({
  onSignIn,
  search,
}: LandingHeaderProps) {
  const { isAuthenticated, openLogin } = useAuthStore();
  const handleSignIn = onSignIn ?? openLogin;
  const pathname = usePathname();
  const isTabActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

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
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 group cursor-pointer relative shrink-0"
            >
              <div className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden shrink-0">
                <Image
                  src="/foxonlylogo.png"
                  alt="FoxPassport Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div className="relative">
                <h2 className="text-sm sm:text-2xl font-display font-bold tracking-tight text-white group-hover:text-[#ccff00] transition-colors">
                  FoxPassport
                </h2>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#ccff00] group-hover:w-full transition-all duration-300"></span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
              {NAV_TABS.map((tab) => {
                const active = isTabActive(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={
                      active
                        ? "px-6 py-2.5 rounded-full text-sm font-bold text-black bg-[#ccff00] hover:bg-[#b8e600] hover:shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all transform hover:-translate-y-0.5"
                        : "px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105"
                    }
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Search — inline input when integrated (e.g. /search), icon-link otherwise */}
              {search ? (
                <div className="relative flex-1 min-w-0 sm:max-w-55 md:max-w-xs">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-[16px] pointer-events-none">
                    search
                  </span>
                  <input
                    type="text"
                    value={search.value}
                    onChange={(e) => search.onChange(e.target.value)}
                    placeholder={search.placeholder ?? "Search anything..."}
                    className="w-full bg-white/6 border border-white/10 rounded-full py-1.5 sm:py-2 pl-10 pr-3 text-xs sm:text-sm font-semibold text-white placeholder:text-white/30 focus:outline-none focus:border-[#ccff00]/40 focus:bg-white/10 transition-all"
                  />
                </div>
              ) : (
                <Link
                  href="/search"
                  className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all hover:rotate-12"
                >
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                    search
                  </span>
                </Link>
              )}

              {/* Sign In + UserMenuButton (Visible across all screens: mobile, tablet, desktop) */}
              {!isAuthenticated && (
                <button
                  onClick={handleSignIn}
                  className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/10 sm:bg-white/5 border border-white/15 px-3.5 sm:px-6 py-1.5 sm:py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 group overflow-hidden relative cursor-pointer"
                >
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                </button>
              )}
              {isAuthenticated && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <NotificationBell />
                  <UserMenuButton onSignIn={handleSignIn} />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile floating capsule bottom nav */}
      <MobileBottomNav onLoginClick={handleSignIn} />
    </>
  );
}
