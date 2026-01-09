"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Bell } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  // State to track if the page has scrolled
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    router.push("/");
  };

  // Effect to handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      // If scrolled more than 10px, set state to true
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Add event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Define conditional classes based on scroll state
  const navbarClasses = isScrolled
    // Scrolled state: Blurry, semi-transparent background, lighter border
    ? "bg-white/70 dark:bg-card-dark/70 backdrop-blur-md border-pink-100/50 dark:border-pink-900/30 shadow-sm"
    // Top state: Solid background (your previous style)
    : "bg-white dark:bg-card-dark border-pink-100 dark:border-pink-900/30 shadow-sm shadow-pink-50/50";

  return (
    <header 
      // Combine base style (sticky, z-index, transition) with the conditional styles above
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 font-sans ${navbarClasses}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* 1. LOGO */}
            <BrandLogo variant="adaptive" />

          {/* 2. SEARCH BAR */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
                <Search className="h-4 w-4" />
              </div>
              {/* Changed bg-pink-50/80 to bg-pink-50/50 so it blends better when blurry */}
              <input 
                className="block w-full rounded-full border-none bg-pink-50/50 dark:bg-background-dark/50 py-2 pl-10 pr-3 text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500/50 transition-all outline-none" 
                placeholder="Search events, locations, hosts..." 
                type="text" 
              />
            </div>
          </div>

          {/* 3. NAVIGATION LINKS & ACTIONS */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="#" className="text-sm font-bold text-gray-600 hover:text-pink-500 transition-colors dark:text-gray-200">Events</Link>
              <Link href="#" className="text-sm font-bold text-gray-600 hover:text-pink-500 transition-colors dark:text-gray-200">Foxers</Link>
              <Link href="#" className="text-sm font-bold text-gray-600 hover:text-pink-500 transition-colors dark:text-gray-200">Community</Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-pink-500 hover:bg-pink-50 rounded-full dark:text-gray-200 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2.5 block h-2.5 w-2.5 rounded-full ring-2 ring-white transform translate-x-1/2 -translate-y-1/2 !bg-[#ec4899]"></span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full ring-2 ring-pink-500/10 ml-1 lg:ml-2">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src={user?.avatar || ""} />
                      <AvatarFallback className="bg-pink-500/10 text-pink-500 font-bold">
                        {user?.username ? (user.username as string)[0].toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}