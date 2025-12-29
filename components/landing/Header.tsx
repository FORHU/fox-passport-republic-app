"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavbar } from "@/hooks/useNavbar";
import UserMenuButton from "@/components/users/UserMenuButton";

const Header: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAuthenticated = !!user;
  const { openLogin, openSignup } = useNavbar();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Image
              src="/logofoxpassport.png"
              alt="Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-gray-900">
            Fox<span className="text-pink-500">Passport</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/?category=Hotels%20%26%20Travel"
            className="text-sm font-semibold text-gray-900 hover:text-pink-500 transition-colors"
          >
            Experiences
          </Link>
          <Link
            href="/?category=Event%20Planning%20%26%20Services"
            className="text-sm font-semibold text-gray-900 hover:text-pink-500 transition-colors"
          >
            Venues
          </Link>
          <Link
            href="/business"
            className="text-sm font-semibold text-gray-900 hover:text-pink-500 transition-colors"
          >
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <button
              onClick={openLogin}
              className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-pink-500/20"
            >
              Start Booking
            </button>
          ) : (
            <UserMenuButton onBecomeHost={() => router.push("/foxer")} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavbar } from "@/hooks/useNavbar";
import UserMenuButton from "@/components/users/UserMenuButton";

const Header: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAuthenticated = !!user;
  const { openLogin, openSignup } = useNavbar();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Image
              src="/logofoxpassport.png"
              alt="Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-gray-900">
            Fox<span className="text-primary">Passport</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/?category=Hotels%20%26%20Travel"
            className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors"
          >
            Experiences
          </Link>
          <Link
            href="/?category=Event%20Planning%20%26%20Services"
            className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors"
          >
            Venues
          </Link>
          <Link
            href="/business"
            className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors"
          >
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <button
              onClick={openLogin}
              className="bg-primary hover:bg-pink-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-primary/20"
            >
              Start Booking
            </button>
          ) : (
            <UserMenuButton onBecomeHost={() => router.push("/foxer")} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
