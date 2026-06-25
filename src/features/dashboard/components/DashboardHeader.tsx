'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRoleAccess, RoleAccess } from '@/features/auth/hooks/useRoleAccess';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import UserMenuButton from '@/features/user/components/UserMenuButton';
import NotificationBell from '@/features/notifications/components/NotificationBell';


export function DashboardHeader() {
  const user = useAuthStore((s) => s.user);
  const access = useRoleAccess();

  const roleLabels: string[] = [];
  if (access.isMayor) roleLabels.push('Mayor');
  if (access.isHost) roleLabels.push('Host');
  if (access.isFoxer) roleLabels.push('Foxer');
  const roleLabel = roleLabels.length > 0 ? roleLabels.join(' · ') : 'Creator';

  const navLinks = [
    { label: 'Overview', href: '/creator-dashboard', anchor: false },
    access.canManageEvents && { label: 'Events', href: '#events', anchor: true },
    access.canManageVenues && { label: 'Venues', href: '#venues', anchor: true },
    access.canManageInventory && { label: 'Assets', href: '#inventory', anchor: true },
    access.canManageServices && { label: 'Services', href: '#services', anchor: true },
  ].filter(Boolean) as { label: string; href: string; anchor: boolean }[];

  return (
    <header className="fixed top-6 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-6 h-20 flex items-center justify-between shadow-2xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:rotate-180 transition-transform duration-700">
              <span className="material-symbols-outlined text-[24px]">explore</span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-display font-bold text-white group-hover:text-[#ccff00] transition-colors">
                FoxPassport
              </h2>
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">
                Creator Dashboard
              </span>
            </div>
          </Link>

          {/* Navigation — only shows sections the user has access to */}
          <nav className="hidden md:flex items-center gap-1 bg-black/30 p-1.5 rounded-full border border-white/5">
            {navLinks.map((link) =>
              link.anchor ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-5 py-2.5 rounded-full text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-5 py-2.5 rounded-full text-sm font-bold text-black bg-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Right Side — real user */}
          <div className="flex items-center gap-4">
            {user && <NotificationBell />}
            <div className="flex items-center gap-3 pl-3 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold">{user?.name || user?.email || 'Creator'}</div>
                <div className="text-xs text-[#ccff00]/70 font-semibold">{roleLabel}</div>
              </div>
              <UserMenuButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

interface WelcomeBannerProps {
  isCreateMenuOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onToggleCreateMenu: () => void;
  onNavigateToCreateEvent: () => void;
  onNavigateToCreateVenue: () => void;
  onNavigateToCreateInventory: () => void;
  onNavigateToCreateService: () => void;
  access: RoleAccess;
}

interface CreateItem {
  label: string;
  icon: string;
  iconColor: string;
  allowed: boolean;
  requiredRole: string;
  applyHref: string;
  onClick: () => void;
}

export function WelcomeBanner({
  isCreateMenuOpen,
  menuRef,
  onToggleCreateMenu,
  onNavigateToCreateEvent,
  onNavigateToCreateVenue,
  onNavigateToCreateInventory,
  onNavigateToCreateService,
  access,
}: WelcomeBannerProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const createItems: CreateItem[] = [
    {
      label: 'Event',
      icon: 'event',
      iconColor: 'text-[#ccff00]',
      allowed: access.canManageEvents,
      requiredRole: 'Mayor',
      applyHref: '/onboarding',
      onClick: onNavigateToCreateEvent,
    },
    {
      label: 'Venue',
      icon: 'apartment',
      iconColor: 'text-pink-500',
      allowed: access.canManageVenues,
      requiredRole: 'Host',
      applyHref: '/creator-dashboard/apply',
      onClick: onNavigateToCreateVenue,
    },
    {
      label: 'Item',
      icon: 'inventory_2',
      iconColor: 'text-purple-400',
      allowed: access.canManageInventory,
      requiredRole: 'Foxer (Asset)',
      applyHref: '/onboarding',
      onClick: onNavigateToCreateInventory,
    },
    {
      label: 'Service',
      icon: 'design_services',
      iconColor: 'text-yellow-400',
      allowed: access.canManageServices,
      requiredRole: 'Foxer (Service)',
      applyHref: '/onboarding',
      onClick: onNavigateToCreateService,
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-[#ccff00]/30 shadow-[0_0_15px_rgba(204,255,0,0.1)] mb-4">
          <span className="flex h-2 w-2 rounded-full bg-[#ccff00] shadow-[0_0_10px_#ccff00] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-white/90">Creator Studio</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-display font-bold mb-2">
          Welcome back,{' '}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            {user?.name?.split(' ')[0] || 'Creator'}!
          </span>
        </h1>
        <p className="text-white/50">
          You have access to{' '}
          {[
            access.canManageVenues && <span key="v" className="text-white font-bold">Venues</span>,
            access.canManageEvents && <span key="e" className="text-white font-bold">Events</span>,
            access.canManageInventory && <span key="i" className="text-white font-bold">Inventory</span>,
            access.canManageServices && <span key="s" className="text-white font-bold">Services</span>,
          ]
            .filter(Boolean)
            .reduce<React.ReactNode[]>((acc, el, i) => (i === 0 ? [el] : [...acc, ', ', el]), [])}
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/creator-dashboard/calendar"
          className="px-6 py-3 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 flex items-center gap-2"
        >
          <span className="material-symbols-outlined">calendar_month</span>
          Calendar
        </Link>
        <div className="relative" ref={menuRef}>
          <button
            onClick={onToggleCreateMenu}
            className="px-8 py-3 rounded-full bg-[#ccff00] text-black font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] hover:scale-105 transition-all"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Create New
          </button>

          {isCreateMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#0f111a] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
              {createItems.map((item, i) => (
                <React.Fragment key={item.label}>
                  {i === 2 && <div className="h-px bg-white/5" />}
                  {item.allowed ? (
                    <button
                      onClick={item.onClick}
                      className="w-full text-left px-4 py-3 hover:bg-white/10 text-sm flex items-center gap-3 transition-colors"
                    >
                      <span className={`material-symbols-outlined ${item.iconColor} text-[18px]`}>{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(item.applyHref)}
                      className="w-full text-left px-4 py-3 hover:bg-white/5 text-sm flex items-center gap-3 opacity-50 hover:opacity-70 transition-opacity group"
                      title={`Apply as ${item.requiredRole} to unlock`}
                    >
                      <span className={`material-symbols-outlined ${item.iconColor} text-[18px]`}>{item.icon}</span>
                      <span className="flex-1 text-white/60">{item.label}</span>
                      <span className="material-symbols-outlined text-[14px] text-white/30 group-hover:text-[#ccff00]/60 transition-colors">lock</span>
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
