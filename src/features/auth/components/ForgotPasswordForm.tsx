"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForgotPassword } from "@/features/auth/hooks/useAuth";
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "@/shared/lib/schema";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { AuthDialogTitle } from "@/features/auth/components/AuthDialogTitle";
import { TextField } from "@/shared/components/ui/TextField";

export default function ForgotPasswordForm() {
  const forgotPasswordMutation = useForgotPassword();
  const setView = useAuthStore((s) => s.setView);
  const setPendingEmail = useAuthStore((s) => s.setPendingEmail);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = (data) => {
    forgotPasswordMutation.mutate(data.email, {
      onSuccess: () => {
        setPendingEmail(data.email);
        setView("reset-password");
      },
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="text-center mb-5 sm:mb-8">
        <AuthDialogTitle className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
          Forgot your password?
        </AuthDialogTitle>
        <p className="text-gray-400 text-sm">
          Enter your email and we&apos;ll send you a reset code.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register("email")}
          label="EMAIL ADDRESS"
          labelClassName="block text-xs font-bold text-white/70 mb-1.5 ml-1"
          placeholder="name@example.com"
          type="email"
          autoComplete="email"
          required
          error={errors.email?.message}
        />

        <button
          type="submit"
          disabled={forgotPasswordMutation.isPending}
          className="btn-neon w-full py-3 sm:py-4 mt-2 rounded-xl bg-accent text-black font-bold text-sm sm:text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {forgotPasswordMutation.isPending ? (
            <>
              <Loader2 aria-hidden="true" className="animate-spin w-5 h-5" />
              <span className="sr-only">Sending…</span>
            </>
          ) : (
            "Send Reset Code"
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => setView("login")}
          className="text-sm font-bold text-white hover:text-accent transition-colors"
        >
          Back to Log in
        </button>
      </div>
    </div>
  );
}
