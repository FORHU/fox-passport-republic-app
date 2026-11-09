import { useAuthStore } from "@/shared/auth/useAuthStore";

/**
 * Returns true if the current user is eligible to submit a Partner Proposal.
 * Eligible roles: users with roleType containing 'eventFoxer' or
 * 'providerFoxer'.
 */
export function useCanPartner(): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  if (user.isEventFoxer) return true;
  const eligibleRoleTypes = ["eventFoxer", "providerFoxer"];
  return (user.roleType ?? []).some((r) => eligibleRoleTypes.includes(r));
}
