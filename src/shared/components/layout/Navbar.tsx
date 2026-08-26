"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import MobileBottomNav from "@/shared/components/layout/MobileBottomNav";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/shared/components/layout/BrandLogo";
import { BrowseDropdown } from "./navbar/BrowseDropdown";
import { HostModal } from "./navbar/HostModal";
import { NavMobileMenu } from "./navbar/NavMobileMenu";
import { useNavbar } from "@/shared/hooks/useNavbar";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import UserMenuButton from "@/features/user/components/UserMenuButton";
import NotificationBell from "@/features/notifications/components/NotificationBell";
import AuthModal from "@/features/auth/components/AuthModal";

function NavbarContent() {
  const router = useRouter();
  const [isHostModalOpen, setHostModalOpen] = useState(false);
  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  const { mobileMenuOpen, setMobileMenuOpen, openLogin, openSignup } =
    useNavbar();

  const handleHostOptionClick = () => {
    setHostModalOpen(false);
    if (isAuthenticated) {
      router.push("/creator-dashboard");
    } else {
      openLogin();
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-110 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4">
          <div className="glass-panel rounded-full px-4 sm:px-6 h-14 sm:h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">
            {/* LOGO */}
            <BrandLogo />

            {/* DESKTOP / TABLET MENU */}
            <div className="hidden lg:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
              <BrowseDropdown />
              <Link
                href="/creator-dashboard"
                className="px-5 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105"
              >
                Create
              </Link>
              <Link
                href="/user/passport"
                className="px-5 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105"
              >
                Passport
              </Link>
              <Link
                href="/booking"
                className="px-5 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105"
              >
                Bookings
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              {/* Search — desktop only */}
              <button
                className="hidden sm:flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all hover:rotate-12"
                aria-label="Search"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                  search
                </span>
              </button>
              {/* Notification bell — all sizes when authenticated */}
              {isAuthenticated && <NotificationBell />}
              {/* Auth — desktop only */}
              {!isAuthenticated ? (
                <button
                  onClick={openLogin}
                  className="hidden md:flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-5 py-2 lg:px-6 lg:py-2.5 text-xs lg:text-sm font-bold text-white hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 group overflow-hidden relative"
                >
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                </button>
              ) : (
                <UserMenuButton />
              )}

              {/* Opens the browse/auth panel. This is not a duplicate of
                  MobileBottomNav: that carries the four primary destinations and
                  Create, while this holds the browse categories and the
                  secondary links that do not fit there. */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex lg:hidden h-10 w-10 items-center justify-center rounded-full bg-white/10 border border-white/10 text-white hover:bg-white hover:text-black active:scale-95 transition-all"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {mobileMenuOpen ? "close" : "menu"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <NavMobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onOpenHostModal={() => setHostModalOpen(true)}
          onOpenLogin={openLogin}
          onOpenSignup={openSignup}
        />
      </nav>

      {/* Floating capsule bottom nav — mobile only */}
      <MobileBottomNav
        onCreateClick={() => setHostModalOpen(true)}
        onLoginClick={openLogin}
      />

      {/* Host Option Modal */}
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
  return (
    <Suspense fallback={<div className="h-20" />}>
      <NavbarContent />
    </Suspense>
  );
}
