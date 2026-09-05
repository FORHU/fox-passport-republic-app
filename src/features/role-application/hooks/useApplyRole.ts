"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import { useRouter } from "next/navigation";

export type RoleType =
  "venueFoxer" | "gearFoxer" | "serviceFoxer" | "investor" | "eventFoxer";

interface ApplyRolePayload {
  roleType: RoleType;
  data: any;
}

interface ApplyRoleResponse {
  success: boolean;
  message: string;
  data: any;
}

const applyRole = async (
  payload: ApplyRolePayload,
): Promise<ApplyRoleResponse> => {
  const response = await api.post("/role-requests/apply", payload);
  return response.data;
};

export const useApplyRole = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: ApplyRolePayload) => applyRole(payload),
    onSuccess: (data) => {
      toast.success(data.message || "Application submitted successfully!");
      setTimeout(() => {
        router.push("/onboarding");
      }, 1500);
    },
    onError: (error: any) => {
      console.error("Error applying for role:", error);
      const msg =
        error.response?.data?.message || "Failed to submit application";
      toast.error(msg);
    },
  });
};
