"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Settings, 
  FolderKanban, 
  BookText, 
  ChevronDown, 
  ChevronRight,
  ChevronsUpDown,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem = ({ href, icon, label }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
        isActive ? "bg-pink-50 text-primary dark:bg-pink-900/20" : "text-text-sub-light dark:text-text-sub-dark"
      )}
    >
      {icon}
      {label}
    </Link>
  );
};

export default function Sidebar({ className }: { className?: string }) {
  const { user, logout } = useAuthStore();
  const [openGroup, setOpenGroup] = useState<string | null>("platform");

  const toggleGroup = (group: string) => {
    setOpenGroup(openGroup === group ? null : group);
  };

  return (
    <div className={cn("flex h-full flex-col gap-2 bg-white dark:bg-card-dark", className)}>
      
      {/* Sidebar Header */}
      <div className="flex h-16 items-center border-b border-pink-100 px-6 dark:border-pink-900/30">
        <Link href="/foxer" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-xl">🦊</span>
          </div>
          <div className="flex flex-col">
            <span className="text-primary">FoxAdmin</span>
            <span className="text-xs font-normal text-text-sub-light">Enterprise</span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 text-text-sub-light" />
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          
          {/* Platform Group */}
          <div>
            <button
              onClick={() => toggleGroup("platform")}
              className="flex w-full items-center justify-between py-2 text-text-sub-light hover:text-primary"
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4" />
                <span>Platform</span>
              </div>
              {openGroup === "platform" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {openGroup === "platform" && (
              <div className="mt-1 space-y-1 pl-6">
                <NavItem href="/foxer" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
                <NavItem href="/foxer/bookings" icon={<CalendarDays className="h-4 w-4" />} label="Bookings" />
                <NavItem href="/foxer/settings" icon={<Settings className="h-4 w-4" />} label="Settings" />
              </div>
            )}
          </div>

          {/* Projects Group */}
          <div className="mt-4">
             <button
              onClick={() => toggleGroup("projects")}
              className="flex w-full items-center justify-between py-2 text-text-sub-light hover:text-primary"
            >
              <div className="flex items-center gap-3">
                <FolderKanban className="h-4 w-4" />
                <span>Projects</span>
              </div>
              {openGroup === "projects" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>

          {/* Documentation Group */}
          <div className="mt-4">
             <button
              onClick={() => toggleGroup("docs")}
              className="flex w-full items-center justify-between py-2 text-text-sub-light hover:text-primary"
            >
              <div className="flex items-center gap-3">
                <BookText className="h-4 w-4" />
                <span>Documentation</span>
              </div>
              {openGroup === "docs" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
          
        </nav>
      </div>
      
      {/* User Profile Section */}
      <div className="mt-auto border-t border-pink-100 p-4 dark:border-pink-900/30">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-all hover:bg-pink-50 dark:hover:bg-pink-900/20">
              <Avatar className="h-9 w-9 border border-pink-100">
                <AvatarImage src={user?.avatar || ""} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {user?.username ? (user.username as string)[0].toUpperCase() : "P"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium">{user?.username || "patatas"}</span>
                <span className="truncate text-xs text-text-sub-light">{user?.email || "patatas@gmaill.com"}</span>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-text-sub-light" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </div>
  );
}