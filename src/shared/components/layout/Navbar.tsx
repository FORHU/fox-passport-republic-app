"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
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
          <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">
            {/* LOGO */}
            <BrandLogo />

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
              <BrowseDropdown />
              <Link
                href="/creator-dashboard"
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105"
              >
                Host
              </Link>
              <Link
                href="/user/passport"
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105"
              >
                Passport
              </Link>
              <Link
                href="/booking"
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105"
              >
                Bookings
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all hover:rotate-12"
                aria-label="Search"
              >
                <span className="material-symbols-outlined text-[20px]">
                  search
                </span>
              </button>

              {isAuthenticated && <NotificationBell />}

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
                aria-label="Toggle navigation menu"
              >
                <span className="material-symbols-outlined">
                  {mobileMenuOpen ? "close" : "menu"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Modular Mobile Menu */}
        <NavMobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onOpenHostModal={() => setHostModalOpen(true)}
          onOpenLogin={openLogin}
          onOpenSignup={openSignup}
        />
      </nav>

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
    <Suspense fallback={<div className="h-[80px]" />}>
      <NavbarContent />
    </Suspense>
  );
}
