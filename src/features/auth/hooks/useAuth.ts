"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { LoginFormData, SignupFormData } from "@/shared/lib/schema";
import { LoginResponse } from "@/shared/auth/types";
import { canAccessAdmin } from "@/shared/lib/permissions";
import { takeReturnTo } from "@/shared/auth/returnTo";
import { getLandingPath } from "@/shared/lib/dashboard-path";

// These used to go through a private axios instance pointed straight at
// `config.apiUrl` - the one place the browser talked to the API directly, and
// the one that establishes the session. They share the proxy client with every
// other request now, so there is a single browser-facing auth boundary.
//
// `withCredentials` went with it: /api/proxy is same-origin, so cookies ride
// along without being asked to.

import { authClient } from "@/shared/auth/auth-client";

// --- REAL API FUNCTIONS ---
//
// Every flow goes through Better Auth (docs/BETTER-AUTH-CONSOLIDATION.md in the
// API repo). Its errors are rethrown in the axios shape the hooks below read
// (`error.response.status` / `.data.message`), so their messages still show.

interface AuthClientError {
  status?: number;
  message?: string;
}

function fail(error: AuthClientError, fallback: string): never {
  throw Object.assign(new Error(error.message || fallback), {
    response: { status: error.status, data: { message: error.message } },
  });
}

/** What the hooks read on success; Better Auth returns no message of ours. */
const DONE: { message?: string } = {};

const realLogin = async (data: LoginFormData): Promise<LoginResponse> => {
  const result = await authClient.signIn.email({
    email: data.email,
    password: data.password,
  });
  if (result.error || !result.data) {
    fail(result.error ?? {}, "Login Failed. Please check your credentials.");
  }

  const user = ((result.data as any)?.user || {}) as Record<string, any>;
  const token = (result.data as any)?.session?.token || "";
  // Better Auth's user has no `permissions`, and every client-side gate
  // (the admin console included) reads them - so take them from /profile
  // now rather than showing "Permission Denied" until the next poll.
  try {
    const { data: profile } = await api.get("/profile");
    const permissions = (profile?.data ?? profile)?.permissions;
    if (Array.isArray(permissions)) user.permissions = permissions;
  } catch {
    // Login still succeeds; the profile poll fills them in later.
  }
  return {
    accessToken: token,
    refreshToken: token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username || "",
      systemRole: user.systemRole || "user",
      roleType: user.roleType || [],
      isEmailVerified: user.emailVerified ?? false,
      ...user,
    },
  };
};

const realForgotPassword = async (email: string) => {
  const result = await authClient.emailOtp.requestPasswordReset({ email });
  if (result.error) fail(result.error, "Could not send a reset code.");
  return DONE;
};

const realResetPassword = async (data: {
  email: string;
  otpCode: string;
  newPassword: string;
}) => {
  const result = await authClient.emailOtp.resetPassword({
    email: data.email,
    otp: data.otpCode,
    password: data.newPassword,
  });
  if (result.error) fail(result.error, "Could not reset the password.");
  return DONE;
};

const realVerifyEmail = async (data: { email: string; otpCode: string }) => {
  const result = await authClient.emailOtp.verifyEmail({
    email: data.email,
    otp: data.otpCode,
  });
  if (result.error) fail(result.error, "Invalid or expired code.");
  return DONE;
};

const realResendOtp = async (email: string) => {
  const result = await authClient.emailOtp.sendVerificationOtp({
    email,
    type: "email-verification",
  });
  if (result.error) fail(result.error, "Could not send a new code.");
  return DONE;
};

const realSignup = async (data: SignupFormData) => {
  const result = await authClient.signUp.email({
    email: data.email,
    password: data.password,
    name: data.name,
  });

  if (result.error) {
    throw new Error(result.error.message || "Failed to create account");
  }

  return {
    success: true,
    message: "Registration successful",
    user: (result.data as any)?.user,
  };
};

// --- HOOKS ---

export const useLogin = () => {
  const router = useRouter();
  const { login, close, setView, setPendingVerificationEmail } =
    useAuthStore();

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
        router.push(takeReturnTo(getLandingPath(data.user)));
      }
    },
    onError: (error: any, variables) => {
      console.error("Login Error:", error);
      if (error.response?.status === 403) {
        setPendingVerificationEmail(variables.email);
        setView("verify-email");
        toast.error("Please verify your email before logging in.");
        return;
      }
      const msg =
        error.response?.data?.message ||
        "Login Failed. Please check your credentials.";
      toast.error(msg);
    },
  });
};

export const useSignup = () => {
  const { setView, setPendingVerificationEmail } = useAuthStore();

  return useMutation({
    mutationFn: realSignup,
    onSuccess: (data, variables) => {
      console.log("Signup Success:", data);

      toast.success("Account created! Please verify your email.");

      // Carry the email forward and show the OTP entry screen
      setPendingVerificationEmail(variables.email);
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
