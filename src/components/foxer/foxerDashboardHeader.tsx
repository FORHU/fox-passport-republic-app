"use client";

import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/src/components/ui/sheet";
import { Button } from "@/src/components/ui/button";
import { Menu, Search, Bell, Plus } from "lucide-react";
import Sidebar from "@/src/components/foxer/Sidebar";
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

export default function DashboardHeader() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-pink-100 bg-white/80 backdrop-blur-sm px-6 dark:bg-background-dark/80 dark:border-pink-900/30">
      
      {/* MOBILE MENU */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0 md:hidden text-primary">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 border-r-pink-100 bg-background-light">
          <Sidebar className="border-none" />
        </SheetContent>
      </Sheet>

      {/* SEARCH BAR */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-sub-light group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="Search events, foxxers..." 
            className="w-full h-10 rounded-full border border-pink-200 bg-pink-50/50 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:bg-pink-900/10 dark:border-pink-800 transition-all"
          />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-3">
        <Button size="sm" className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" />
          <span>Create Event</span>
        </Button>
        
        <Button variant="ghost" size="icon" className="text-text-sub-light hover:text-primary hover:bg-pink-50 rounded-full">
          <Bell className="h-5 w-5" />
        </Button>

        {/* USER DROPDOWN */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full ring-2 ring-primary/10 ml-1">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={user?.avatar || ""} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
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
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}