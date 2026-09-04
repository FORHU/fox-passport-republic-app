import React from "react";

// Shared full-viewport loading state — used by route-level `loading.tsx`
// files (shown automatically while a segment is fetching/compiling) and by
// any client component that wants the same look while it renders.
export default function PageLoader({
  label = "Loading…",
}: {
  label?: string;
}) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#02040a]">
      <div className="h-10 w-10 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
      <p className="font-display text-sm uppercase tracking-widest text-white/40">
        {label}
      </p>
    </div>
  );
}
