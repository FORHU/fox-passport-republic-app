'use client';

import { useAuthStore } from '@/store/useAuthStore';

export interface RoleAccess {
  canManageVenues: boolean;    // host, mayor
  canManageEvents: boolean;    // mayor
  canManageInventory: boolean; // foxerAsset, foxer
  canManageServices: boolean;  // foxerService, foxer
  isAdmin: boolean;
  isMayor: boolean;
  isHost: boolean;
  isFoxer: boolean;
}

export function useRoleAccess(): RoleAccess {
  const user = useAuthStore((s) => s.user);

  const sysRole = (user?.systemRole || user?.role || '').toLowerCase();
  const roleTypes: string[] = user?.roleType ?? [];

  const isAdmin = sysRole === 'admin' || sysRole === 'super_admin';
  const isMayor = roleTypes.includes('mayor') || sysRole === 'mayor';
  const isHost = roleTypes.includes('host') || sysRole === 'host' || isMayor || isAdmin;
  const isFoxer =
    roleTypes.some((r) => ['foxer', 'foxerAsset', 'foxerService'].includes(r)) ||
    sysRole === 'foxer';

  return {
    canManageVenues: isHost || isAdmin,
    canManageEvents: isMayor || isAdmin,
    canManageInventory: isFoxer || isAdmin,
    canManageServices: isFoxer || isAdmin,
    isAdmin,
    isMayor,
    isHost,
    isFoxer,
  };
}
