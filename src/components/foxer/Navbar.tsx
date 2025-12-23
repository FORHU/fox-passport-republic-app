"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image"; // Added next/image import
import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-card-dark border-b border-pink-100 dark:border-pink-900/30 shadow-sm shadow-pink-50/50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* 1. LOGO (Updated with your custom code) */}
          <div className="flex-shrink-0 cursor-pointer">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logofoxpassport.png" 
                alt="Logo" 
                width={80} 
                height={80} 
                className="h-10 md:h-12 w-auto object-contain" // Adjusted slightly for navbar height
                priority 
              />
              <span className="hidden md:block text-2xl font-bold tracking-tight transition-all duration-500 ease-in-out text-gray-900 dark:text-white">
                Fox<span className="text-pink-500">Passport</span>
              </span>
            </Link>
          </div>

          {/* 2. SEARCH BAR */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
                <Search className="h-4 w-4" />
              </div>
              <input 
                className="block w-full rounded-full border-none bg-pink-50/80 dark:bg-background-dark py-2 pl-10 pr-3 text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500/50 transition-all outline-none" 
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
              <Button size="sm" className="hidden sm:flex bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 rounded-full shadow-md shadow-pink-500/20 transition-transform hover:scale-105">
                <Plus className="h-4 w-4 mr-1" />
                Create Event
              </Button>
              
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-pink-500 hover:bg-pink-50 rounded-full dark:text-gray-200">
                <Bell className="h-5 w-5" />
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