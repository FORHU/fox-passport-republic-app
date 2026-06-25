import { useAuthStore } from '@/store/useAuthStore';

/**
 * Returns true if the current user is eligible to submit a Partner Proposal.
 * Eligible roles: mayor (systemRole), or users with roleType containing
 * 'host', 'foxerService', 'foxerAsset', or 'eventFoxer'.
 */
export function useCanPartner(): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  if (user.systemRole === 'mayor') return true;
  if (user.isHost) return true;
  const eligibleRoleTypes = ['host', 'foxerService', 'foxerAsset', 'eventFoxer'];
  return (user.roleType ?? []).some((r) => eligibleRoleTypes.includes(r));
}
