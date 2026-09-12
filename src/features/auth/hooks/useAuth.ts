"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { LoginFormData, SignupFormData } from "@/shared/lib/schema";
import { LoginResponse } from "@/shared/auth/types";
import { canAccessAdmin } from "@/shared/lib/permissions";

// These used to go through a private axios instance pointed straight at
// `config.apiUrl` - the one place the browser talked to the API directly, and
// the one that establishes the session. They share the proxy client with every
// other request now, so there is a single browser-facing auth boundary.
//
// `withCredentials` went with it: /api/proxy is same-origin, so cookies ride
// along without being asked to.

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
  const rest: Partial<SignupFormData> = { ...data };
  delete rest.confirmPassword;
  const payload = {
    ...rest,
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

      // No cookie write here any more. The API sets them on its own login
      // response and the proxy relays those headers, so they are committed by
      // the browser before this callback runs at all.
      //
      // The ordering this replaces was load-bearing and worth remembering:
      // `login(data)` flips `isAuthenticated` synchronously, and everything
      // gated on that fires immediately. When the cookies were written by a
      // separate Server Action afterwards, those requests could reach the proxy
      // before the Set-Cookie was committed - the proxy forwarded them
      // unauthenticated, the API answered 401, and the interceptor read that as
      // an expired session and signed the user out seconds after signing in.

      // Save user to store
      login(data);

      toast.success("Welcome back!");

      // Close modal and redirect based on role
      close();
      if (canAccessAdmin(data.user)) {
        router.push("/admin");
      } else if (
        typeof window !== "undefined" &&
        localStorage.getItem("fp_new_user")
      ) {
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
      toast.success(
        data.message || "If an account exists, a reset code has been sent.",
      );
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        "Failed to send reset code. Please try again.";
      toast.error(msg);
    },
  });
};

export const useResetPassword = () => {
  const { toggleView } = useAuthStore();

  return useMutation({
    mutationFn: realResetPassword,
    onSuccess: (data) => {
      toast.success(
        data.message || "Password reset successfully! You can now log in.",
      );
      toggleView(); // switch back to login view
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        "Failed to reset password. Please try again.";
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
      const msg =
        error.response?.data?.message ||
        "Verification failed. Please check your code.";
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
      const msg =
        error.response?.data?.message ||
        "Failed to resend code. Please try again.";
      toast.error(msg);
    },
  });
};

export { useLogout } from "@/shared/auth/useLogout";
