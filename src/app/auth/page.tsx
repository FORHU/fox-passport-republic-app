"use client";

import MobileAuthPage from "@/features/auth/components/MobileAuthPage";
import { useAuthStore } from "@/shared/auth/useAuthStore";

export default function AuthPage() {
  const openLogin = useAuthStore((state) => state.openLogin);

  return (
    <>
      <div className="lg:hidden">
        <MobileAuthPage />
      </div>
      <div className="hidden lg:flex min-h-screen items-center justify-center bg-[#050608]">
        <button
          onClick={openLogin}
          className="h-10 px-6 rounded-full bg-accent text-black text-sm font-bold hover:bg-[#b3e600] transition-colors"
        >
          Sign in
        </button>
      </div>
    </>
  );
}
