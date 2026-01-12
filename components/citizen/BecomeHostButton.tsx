"use client";

import React from "react";
import { Building2 } from "lucide-react";
import { useBecomeHost } from "@/hooks/features/useBecomeHost";
import { useAuthStore } from "@/store/useAuthStore";

export default function BecomeHostButton() {
  const user = useAuthStore((state) => state.user);
  const { mutate: becomeHost, isPending } = useBecomeHost();

  // Don't show button if user is already a host
  if ((user as any)?.isHost || (user as any)?.role === "host") {
    return null;
  }

  const handleBecomeHost = () => {
    if (window.confirm("Are you sure you want to become a mayor? You'll be able to list venues and create events.")) {
      becomeHost();
    }
  };

  return (
    <button
      onClick={handleBecomeHost}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition-colors shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Building2 className="w-5 h-5" />
      {isPending ? "Processing..." : "Become a Mayor"}
    </button>
  );
}
