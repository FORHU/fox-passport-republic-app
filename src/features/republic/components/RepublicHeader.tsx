"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import UserMenuButton from "@/shared/components/layout/UserMenuButton";
import NotificationBell from "@/shared/components/layout/NotificationBell";

export default function RepublicHeader() {
  const { isAuthenticated, openLogin } = useAuthStore();
  const pathname = usePathname();

  const navLinks = [
    { label: "Explore", href: "/" },
    { label: "Foxers", href: "/search" },
    { label: "Map", href: "/venues/map" },
    { label: "Republic", href: "/republic" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#09090e]/95 backdrop-blur-2xl border-b border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between shadow-2xl transition-all">
      {/* ── LEFT: Logo + Home link ────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 group cursor-pointer shrink-0"
        >
          <div className="flex h-9 w-9 items-center justify-center group-hover:scale-105 transition-transform overflow-hidden shrink-0">
            <Image
              src="/foxonlylogo.png"
              alt="FoxPassport Logo"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-lime-400 transition-colors">
              FoxPassport
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-lime-400/10 text-lime-400 border border-lime-400/30">
              Republic
            </span>
          </div>
        </Link>
      </div>

      {/* ── CENTER: Desktop Navigation Tabs ───────────────────────────────── */}
      <nav className="hidden md:flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-full border border-zinc-800/80">
        {navLinks.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={
                active
                  ? "px-4 py-1.5 rounded-full text-xs font-black text-black bg-lime-400 shadow-[0_0_15px_rgba(204,255,0,0.4)] transition-all"
                  : "px-4 py-1.5 rounded-full text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* ── RIGHT: Search, Notifications & Hamburger Menu (Always visible) ── */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/search"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">search</span>
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserMenuButton />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <UserMenuButton onSignIn={openLogin} />
            <button
              onClick={openLogin}
              className="flex items-center gap-1.5 rounded-full bg-lime-400 text-black px-3.5 py-1.5 text-xs font-black hover:bg-lime-300 transition-all cursor-pointer shadow-md"
            >
              <span>Sign In</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
