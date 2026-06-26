"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export type RoleType = "mayor" | "foxerAsset" | "foxerService" | "investor" | "host";

interface ApplyRolePayload {
  roleType: RoleType;
  data: any;
}

interface ApplyRoleResponse {
  success: boolean;
  message: string;
  data: any;
}

const applyRole = async (payload: ApplyRolePayload, accessToken: string): Promise<ApplyRoleResponse> => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/role-requests/apply`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};

export const useApplyRole = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: ApplyRolePayload) => applyRole(payload, accessToken!),
    onSuccess: (data) => {
      toast.success(data.message || "Application submitted successfully!");
      // Redirect back to dashboard after successful application
      setTimeout(() => {
        router.push("/user");
      }, 1500);
    },
    onError: (error: any) => {
      console.error("Error applying for role:", error);
      const msg = error.response?.data?.message || "Failed to submit application";
      toast.error(msg);
    },
  });
};
