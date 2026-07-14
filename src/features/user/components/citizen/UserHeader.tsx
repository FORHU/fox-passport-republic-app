'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import UserMenuButton from '@/features/user/components/UserMenuButton';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import NotificationBell from '@/features/notifications/components/NotificationBell';


interface UserHeaderProps {
  isAuthenticated: boolean;
  userName?: string;
  citizenLevel?: number;
}

function getRoleLabel(systemRole: string, roleTypes: string[]): string {
  const role = systemRole.toLowerCase();
  if (role === 'admin' || role === 'super_admin') return 'Admin';
  if (role === 'mayor' || roleTypes.includes('venueFoxer')) return 'Mayor';

  // Collect all active roles from roleType array
  const active: string[] = [];
  if (role === 'host' || roleTypes.includes('eventFoxer')) active.push('Host');
  if (role === 'foxer' || roleTypes.some(r => r === 'gearFoxer' || r === 'serviceFoxer')) active.push('Foxer');
  if (roleTypes.includes('investor')) active.push('Investor');

  return active.length > 0 ? active.join(' · ') : 'Citizen';
}

export const UserHeader: React.FC<UserHeaderProps> = ({ isAuthenticated, userName, citizenLevel }) => {
  const storeUser = useAuthStore(state => state.user);

  const roleLabel = storeUser
    ? getRoleLabel(storeUser.systemRole ?? '', storeUser.roleType ?? [])
    : 'Citizen';

  const avatarUrl = storeUser?.imgId ?? null;
  const displayName = storeUser?.name || userName || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="fixed top-6 left-0 right-0 z-50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4">
        <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer relative">
            <div className="flex h-12 w-12 items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
              <Image
                src="/foxonlylogo.png"
                alt="FoxPassport Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div className="relative">
              <h2 className="text-2xl font-display font-bold tracking-tight text-white group-hover:text-[#ccff00] transition-colors">FoxPassport</h2>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#ccff00] group-hover:w-full transition-all duration-300"></span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
            <Link href="/user" className="px-6 py-2.5 rounded-full text-sm font-bold text-black bg-[#ccff00] hover:bg-[#b8e600] hover:shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all transform hover:-translate-y-0.5">Dashboard</Link>
            <Link href="/booking" className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105">My Bookings</Link>
            <Link href="/user/passport" className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105">Passport</Link>
            <Link href="/" className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105">Explore</Link>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated && <NotificationBell />}

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3 pl-2">
                <div className="text-right hidden lg:block">
                  <p className="text-xs text-[#ccff00] font-bold uppercase tracking-wide">Hey, {displayName}</p>
                  <p className="text-sm font-bold text-white">{roleLabel}</p>
                </div>
                <UserMenuButton />
              </div>
            ) : (
              <Link href="/" className="hidden sm:flex items-center gap-2 rounded-full bg-[#ccff00] px-6 py-2.5 text-sm font-bold text-black hover:bg-[#b8e600] transition-all">
                Sign In
              </Link>
            )}

            <button className="flex sm:hidden h-10 w-10 items-center justify-center rounded-full bg-white text-black">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
