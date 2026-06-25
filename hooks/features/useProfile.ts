'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';

export interface ProfileData {
  id: string;
  email: string;
  username: string;
  name: string;
  phone: string;
  imgId: string;
  systemRole: string;
  roleType: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  phone?: string;
  profileImage?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function useProfile() {
  const setUser = useAuthStore(state => state.setUser);
  const storeUser = useAuthStore(state => state.user);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await api.get('/profile');
      const data: ProfileData = resp.data?.data ?? resp.data;
      setProfile(data);
      // Read current store state directly to avoid adding storeUser as a dep
      // (which would cause an infinite loop: setUser → storeUser changes → re-fetch)
      const { user: currentUser, setUser: syncUser } = useAuthStore.getState();
      if (currentUser && data.imgId !== undefined) {
        syncUser({ ...currentUser, imgId: data.imgId });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const updateProfile = async (payload: UpdateProfilePayload) => {
    const resp = await api.put('/profile', payload);
    const updated: ProfileData = resp.data?.data ?? resp.data;
    setProfile(updated);
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
    const resp = await api.post('/profile/change-password', payload);
    return resp.data;
  };

  const deleteAccount = async (password: string) => {
    const resp = await api.delete('/profile', {
      data: { password, confirmation: 'DELETE' },
    });
    return resp.data;
  };

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    updateProfile,
    changePassword,
    deleteAccount,
  };
}
