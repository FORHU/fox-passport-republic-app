import React from "react";
import Image from "next/image";

interface PageLoaderProps {
  label?: string;
  /** Fill the viewport (a page or route loading). Turn off to sit inside a
   * card or panel at that container's size. */
  fullScreen?: boolean;
}

/**
 * The one loading screen — route-level `loading.tsx`, auth redirects and any
 * page that has nothing to show until its data arrives. The logo pulses inside
 * two expanding rings above an indeterminate bar, on the app's own background,
 * and it reads correctly in light and dark mode. Motion stops under
 * `prefers-reduced-motion`.
 */
export default function PageLoader({
  label = "Loading",
  fullScreen = true,
}: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative flex w-full flex-col items-center justify-center gap-6 overflow-hidden bg-background bg-gradient-dark ${
        fullScreen ? "h-screen" : "min-h-64 py-16"
      }`}
    >
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span
          aria-hidden
          className="fp-loader-ring absolute inset-0 rounded-full border-2 border-accent"
        />
        <span
          aria-hidden
          className="fp-loader-ring2 absolute inset-0 rounded-full border-2 border-accent"
        />
        <div className="fp-loader-mark relative flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-surface shadow-[0_0_30px_rgba(204,255,0,0.18)]">
          <Image
            src="/foxonlylogo.png"
            alt=""
            width={38}
            height={38}
            priority
            className="fp-loader-logo object-contain"
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-white/70">
          {label}
        </p>
        <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
          <div className="fp-loader-sweep h-full w-2/5 rounded-full bg-accent" />
        </div>
      </div>
    </div>
  );
}
