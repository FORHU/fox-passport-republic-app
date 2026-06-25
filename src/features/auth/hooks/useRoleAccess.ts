'use client';

import { useAuthStore } from '@/features/auth/store/useAuthStore';

export interface RoleAccess {
  canManageVenues: boolean;    // mayor only
  canManageEvents: boolean;    // host only
  canManageInventory: boolean; // foxerAsset
  canManageServices: boolean;  // foxerService
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
  const isHost = roleTypes.includes('host') || sysRole === 'host' || isAdmin;
  const isFoxer =
    roleTypes.some((r) => ['foxer', 'foxerAsset', 'foxerService'].includes(r)) ||
    sysRole === 'foxer';

  return {
    canManageVenues: isMayor || isAdmin,
    canManageEvents: isHost || isAdmin,
    canManageInventory: roleTypes.includes('foxerAsset') || isFoxer || isAdmin,
    canManageServices: roleTypes.includes('foxerService') || isFoxer || isAdmin,
    isAdmin,
    isMayor,
    isHost,
    isFoxer,
  };
}
