"use client";

import api from "@/shared/lib/axios";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import type { RoleType, SystemRole } from "@/shared/auth/types";
import type { Permission } from "@/shared/constants/permissions";

/**
 * The signed-in person as the server describes them.
 *
 * This lives in `shared/auth` rather than in `features/user` because
 * `GET /profile` is the session identity endpoint, not a user-profile screen
 * concern: it is one of the paths that carries the server-derived `permissions`
 * list, and both the session poller and the profile page read it. Two features
 * were importing each other to share it, which is the coupling this move
 * removes.
 *
 * `features/user` still owns everything about *editing* a profile.
 */
export interface ProfileData {
  id: string;
  email: string;
  username: string;
  name: string;
  phone: string;
  imgId: string;
  // Narrowed to the same unions the auth store uses. These were `string` /
  // `string[]`, which meant a profile could not be merged into the store's User
  // without a cast - and a cast here would only have hidden the mismatch.
  systemRole: SystemRole;
  roleType: RoleType[];
  permissions: readonly Permission[];
  createdAt: string;
  updatedAt: string;
}

// The single definition of "fetch the current profile".
//
// useSessionManager polls this same endpoint for role changes. Both hooks used
// to hit GET /profile independently - this one through a raw useEffect React
// Query could not see - so any page using both fetched the profile twice and
// the copies could disagree. They now share one key AND one fetcher: sharing
// only the key would mean whichever hook happened to run its own queryFn first
// decided the behaviour.
export const PROFILE_QUERY_KEY = ["me"] as const;

export async function fetchProfile(): Promise<ProfileData> {
  const resp = await api.get("/profile");
  const data: ProfileData = resp.data?.data ?? resp.data;

  // Sync the whole user, not just the avatar: roleType changes when an admin
  // approves a role application, and the navbar and route guards read it from
  // the store. Read current state directly rather than closing over it, so this
  // does not depend on the state it writes.
  const { user: currentUser, setUser } = useAuthStore.getState();
  if (data) {
    setUser(currentUser ? { ...currentUser, ...data } : data);
  }
  return data;
}
