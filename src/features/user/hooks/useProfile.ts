"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import type { RoleType, SystemRole } from "@/features/auth/types/auth";

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
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  phone?: string;
  profileImage?: string;
  city?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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

export function useProfile() {
  const setUser = useAuthStore((state) => state.setUser);
  const storeUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const {
    data: profile = null,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<ProfileData>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchProfile,
  });

  const error = queryError
    ? ((queryError as any)?.response?.data?.message ?? "Failed to load profile")
    : null;

  const updateProfile = async (payload: UpdateProfilePayload) => {
    const resp = await api.put("/profile", payload);
    const updated: ProfileData = resp.data?.data ?? resp.data;
    // Write through the shared cache so useSessionManager sees the new profile
    // too, instead of holding a stale copy under the same key.
    queryClient.setQueryData(PROFILE_QUERY_KEY, updated);
    // Sync back into the auth store so Navbar/menu reflects the change immediately
    if (storeUser) {
      setUser({
        ...storeUser,
        name: updated.name,
        username: updated.username,
        mobileNumber: updated.phone,
        imgId: updated.imgId,
      });
    }
    return updated;
  };

  const changePassword = async (payload: ChangePasswordPayload) => {
    const resp = await api.post("/profile/change-password", payload);
    return resp.data;
  };

  const deleteAccount = async (password: string) => {
    const resp = await api.delete("/profile", {
      data: { password, confirmation: "DELETE" },
    });
    return resp.data;
  };

  return {
    profile,
    isLoading,
    error,
    refetch,
    updateProfile,
    changePassword,
    deleteAccount,
  };
}
