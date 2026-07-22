"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForgotPassword } from "@/features/auth/hooks/useAuth";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/shared/lib/schema";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export default function ForgotPasswordForm() {
  const forgotPasswordMutation = useForgotPassword();
  const setView = useAuthStore((s) => s.setView);
  const setPendingEmail = useAuthStore((s) => s.setPendingEmail);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
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
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">Forgot your password?</h2>
        <p className="text-gray-400 text-sm">Enter your email and we&apos;ll send you a reset code.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="group">
          <label className="block text-xs font-bold text-white/70 mb-1.5 ml-1">EMAIL ADDRESS</label>
          <input
            {...register("email")}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#ccff00] focus:border-[#ccff00]/50 focus:bg-white/10 transition-all font-medium"
            placeholder="name@example.com"
            type="email"
          />
          {errors.email && <span className="text-xs text-red-500 ml-1">{errors.email.message}</span>}
        </div>

        <button
          type="submit"
          disabled={forgotPasswordMutation.isPending}
          className="btn-neon w-full py-3 sm:py-4 mt-2 rounded-xl bg-[#ccff00] text-black font-bold text-sm sm:text-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {forgotPasswordMutation.isPending ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            "Send Reset Code"
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <button onClick={() => setView("login")} className="text-sm font-bold text-white hover:text-[#ccff00] transition-colors">
          Back to Log in
        </button>
      </div>
    </div>
  );
}