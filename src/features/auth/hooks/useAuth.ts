"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { LoginFormData, SignupFormData } from "@/shared/lib/schema";
import { LoginResponse } from "@/features/auth/types/auth";
import { config } from "@/shared/lib/config";
import { setAuthCookies, clearAuthCookies } from "@/shared/lib/server/auth-actions";

// --- AXIOS SETUP ---
const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- REAL API FUNCTIONS ---

const realLogin = async (data: LoginFormData): Promise<LoginResponse> => {
  const payload = {
    email: data.email,
    password: data.password,
  };
  const response = await api.post<LoginResponse>("/auth/login", payload);
  return response.data;
};

const realForgotPassword = async (email: string) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

const realResetPassword = async (data: {
  email: string;
  otpCode: string;
  newPassword: string;
}) => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};

const realVerifyEmail = async (data: { email: string; otpCode: string }) => {
  const response = await api.post("/auth/verify-email", data);
  return response.data;
};

const realResendOtp = async (email: string) => {
  const response = await api.post("/auth/resend-verification-otp", { email });
  return response.data;
};

const realSignup = async (data: SignupFormData) => {
  const payload = {
    ...data,
    name: data.name || undefined,
    mobileNumber: data.mobileNumber || undefined,
  };
  const response = await api.post("/auth/register", payload);
  return response.data;
};

// --- HOOKS ---

export const useLogin = () => {
  const router = useRouter();
  const { login, close } = useAuthStore();

  return useMutation({
    mutationFn: realLogin,
    onSuccess: async (data) => {
      console.log("Login Success:", data);

      // Save user to store
      login(data);

      // Set cookies on server so middleware can read them
      await setAuthCookies(data);

      toast.success("Welcome back!");

      // Close modal and redirect based on role
      close();
      const userRole = (data.user?.systemRole ?? data.user?.role)?.toLowerCase();
      if (userRole === "admin" || userRole === "super_admin") {
        router.push("/admin");
      } else if (typeof window !== "undefined" && localStorage.getItem("fp_new_user")) {
        localStorage.removeItem("fp_new_user");
        router.push("/onboarding");
      } else {
        router.push("/");
      }
    },
    onError: (error: any) => {
      console.error("Login Error:", error);
      const msg =
        error.response?.data?.message ||
        "Login Failed. Please check your credentials.";
      toast.error(msg);
    },
  });
};

export const useSignup = () => {
  const { setView, setPendingEmail } = useAuthStore();

  return useMutation({
    mutationFn: realSignup,
    onSuccess: (data, variables) => {
      console.log("Signup Success:", data);

      toast.success("Account created! Please verify your email.");

      // Carry the email forward and show the OTP entry screen
      setPendingEmail(variables.email);
      setView("verify-email");
    },
    onError: (error: any) => {
      console.error("Signup Error:", error);
      const msg =
        error.response?.data?.message || "Signup Failed. Please try again.";
      toast.error(msg);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: realForgotPassword,
    onSuccess: (data) => {
      toast.success(data.message || "If an account exists, a reset code has been sent.");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to send reset code. Please try again.";
      toast.error(msg);
    },
  });
};

export const useResetPassword = () => {
  const { toggleView } = useAuthStore();

  return useMutation({
    mutationFn: realResetPassword,
    onSuccess: (data) => {
      toast.success(data.message || "Password reset successfully! You can now log in.");
      toggleView(); // switch back to login view
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to reset password. Please try again.";
      toast.error(msg);
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: realVerifyEmail,
    onSuccess: (data) => {
      toast.success(data.message || "Email verified successfully!");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Verification failed. Please check your code.";
      toast.error(msg);
    },
  });
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: realResendOtp,
    onSuccess: (data) => {
      toast.success(data.message || "A new code has been sent to your email.");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to resend code. Please try again.";
      toast.error(msg);
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const { logout } = useAuthStore();

  return async () => {
    // Clear cookies on server
    await clearAuthCookies();

    // Clear client store
    logout();

    // Redirect to home
    router.push("/");
  };
};
