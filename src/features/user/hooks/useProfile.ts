"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import {
  PROFILE_QUERY_KEY,
  fetchProfile,
  type ProfileData,
} from "@/shared/auth/profile";

// Re-exported so existing importers keep working. The definitions moved to
// shared/auth because GET /profile is the session identity endpoint, not a
// profile-screen concern -- see the note there.
export { PROFILE_QUERY_KEY, fetchProfile };
export type { ProfileData };

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
