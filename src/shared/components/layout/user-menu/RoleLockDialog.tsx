"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { RoleDef } from "./types";

interface RoleLockDialogProps {
  role: RoleDef;
  onClose: () => void;
}

export function RoleLockDialog({ role, onClose }: RoleLockDialogProps) {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#0f111a] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
            {role.emoji}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{role.label}</h3>
            <p className="text-white/40 text-xs">{role.description}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <Lock className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-yellow-300/80 text-sm leading-relaxed">
            You need the{" "}
            <span className="font-bold text-yellow-300">
              {role.label.replace(" Dashboard", "")}
            </span>{" "}
            role to access this dashboard. Apply and wait for admin approval.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              onClose();
              router.push(role.applyHref);
            }}
            className="flex-1 py-2.5 rounded-xl bg-[#ccff00] text-black font-bold text-sm hover:bg-[#b8e600] transition cursor-pointer"
          >
            Apply Now
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 font-bold text-sm hover:bg-white/10 transition cursor-pointer"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
