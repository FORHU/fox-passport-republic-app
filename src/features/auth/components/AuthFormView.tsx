"use client";

import { useAuthStore } from "@/shared/auth/useAuthStore";
import LoginForm from "@/features/auth/components/LoginForm";
import SignupForm from "@/features/auth/components/SignupForm";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";
import VerifyEmailForm from "@/features/auth/components/VerifyEmailForm";

/** The auth form for the store's current view: in the popup and on /auth. */
export default function AuthFormView() {
  const view = useAuthStore((state) => state.view);

  return (
    <>
      {view === "login" && <LoginForm />}
      {view === "signup" && <SignupForm />}
      {view === "forgot-password" && <ForgotPasswordForm />}
      {view === "reset-password" && <ResetPasswordForm />}
      {view === "verify-email" && <VerifyEmailForm />}
    </>
  );
}
