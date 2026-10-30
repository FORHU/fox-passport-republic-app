import type { Metadata } from "next";
import Link from "next/link";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import NotFoundStamp from "./_components/NotFoundStamp";

export const metadata: Metadata = {
  title: "Page not found | FoxPassport",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas text-white antialiased selection:bg-accent selection:text-black">
      <LandingHeader />

      <main className="flex flex-1 items-center px-4 pb-32 pt-28 sm:px-6 sm:pt-36 lg:px-8 lg:pb-16 lg:pt-40">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          {/* The numerals are decoration; the h1 carries the meaning. */}
          <p
            aria-hidden="true"
            className="flex items-center font-display text-[clamp(7rem,min(40vw,30dvh),20rem)] font-bold lg:text-[min(22vw,20rem)] leading-[0.85] tracking-tighter"
          >
            <span>4</span>
            <NotFoundStamp />
            <span>4</span>
          </p>

          <div className="max-w-md space-y-6">
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              This page isn&apos;t on the map.
            </h1>
            <p className="text-base leading-relaxed text-white/60">
              The link may be broken or the page has moved. Head home and start
              again.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-accent px-6 py-3 text-sm font-bold text-black transition-all hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              >
                Back to home
              </Link>
              <Link
                href="/search"
                className="text-sm font-semibold text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                Browse Foxers
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
