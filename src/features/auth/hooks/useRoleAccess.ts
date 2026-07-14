'use client';

import { useAuthStore } from '@/features/auth/store/useAuthStore';

export interface RoleAccess {
  canManageVenues: boolean;    // venueFoxer only
  canManageEvents: boolean;    // eventFoxer only
  canManageInventory: boolean; // gearFoxer
  canManageServices: boolean;  // serviceFoxer
  isAdmin: boolean;
  isMayor: boolean;
  isHost: boolean;
  isFoxer: boolean;
}

export function useRoleAccess(): RoleAccess {
  const user = useAuthStore((s) => s.user);

  const sysRole = (user?.systemRole || '').toLowerCase();
  const roleTypes: string[] = user?.roleType ?? [];

  const isAdmin = sysRole === 'admin' || sysRole === 'super_admin';
  const isMayor = roleTypes.includes('venueFoxer');
  const isHost = roleTypes.includes('eventFoxer') || isAdmin;
  const isFoxer = roleTypes.some((r) => ['gearFoxer', 'serviceFoxer'].includes(r));

  return {
    canManageVenues: isMayor || isAdmin,
    canManageEvents: isHost || isAdmin,
    canManageInventory: roleTypes.includes('gearFoxer') || isFoxer || isAdmin,
    canManageServices: roleTypes.includes('serviceFoxer') || isFoxer || isAdmin,
    isAdmin,
    isMayor,
    isHost,
    isFoxer,
  };
}
