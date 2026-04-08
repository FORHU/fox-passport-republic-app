"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

interface BecomeHostResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    username: string;
    name: string;
    role: string;
    isHost: boolean;
  };
}

const becomeHost = async (accessToken: string): Promise<BecomeHostResponse> => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/users/become-host`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const useBecomeHost = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);
  const openLogin = useAuthStore((state) => state.openLogin);

  return useMutation({
    mutationFn: () => becomeHost(accessToken!),
    onSuccess: (data) => {
      toast.success(data.message);

      // Log out the user so they can log in again with new role
      setTimeout(() => {
        toast.info("Logging you out... Please log in again to refresh your session.");
        setTimeout(() => {
          logout();
          // Open login modal after logout
          setTimeout(() => {
            openLogin();
          }, 100);
        }, 2000);
      }, 1500);
    },
    onError: (error: any) => {
      console.error("Error becoming host:", error);
      const msg = error.response?.data?.message || "Failed to become host";
      toast.error(msg);
    },
  });
};
