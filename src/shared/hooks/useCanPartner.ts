import { useAuthStore } from '@/features/auth/store/useAuthStore';

/**
 * Returns true if the current user is eligible to submit a Partner Proposal.
 * Eligible roles: or users with roleType containing
 * 'eventFoxer', 'serviceFoxer', or 'gearFoxer'.
 */
export function useCanPartner(): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  if (user.isEventFoxer) return true;
  const eligibleRoleTypes = ['eventFoxer', 'serviceFoxer', 'gearFoxer'];
  return (user.roleType ?? []).some((r) => eligibleRoleTypes.includes(r));
}
