"use client";

import { useEffect } from "react";

/**
 * Where Stripe's payout setup sends a person who started it from the mobile
 * app (mobile#476). Stripe only accepts https return/refresh URLs, so the API
 * points them here and this page hands off to the app's own link. The app
 * opens Stripe in an auth session that closes as soon as this link fires; the
 * button covers a browser that won't follow the automatic redirect.
 */
export const APP_LINKS = {
  return: "foxpassport://app/stripe/return",
  refresh: "foxpassport://app/stripe/refresh",
} as const;

export type HandoffStep = keyof typeof APP_LINKS;

const COPY: Record<HandoffStep, { title: string; body: string }> = {
  return: {
    title: "Payout setup saved",
    body: "Taking you back to FoxPassport to see your payout status.",
  },
  refresh: {
    title: "This setup link has expired",
    body: "Go back to FoxPassport and we'll open a new one for you.",
  },
};

export default function AppHandoff({ step }: { step: HandoffStep }) {
  const link = APP_LINKS[step];
  const { title, body } = COPY[step];

  useEffect(() => {
    window.location.replace(link);
  }, [link]);

  return (
    <main className="min-h-screen bg-canvas text-gray-200 antialiased flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-black tracking-tight text-white font-display mb-3">
          {title}
        </h1>
        <p className="text-sm text-gray-400 leading-relaxed mb-8">{body}</p>
        <a
          href={link}
          className="inline-flex w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
        >
          Open FoxPassport
        </a>
        <p className="mt-4 text-xs text-gray-500">
          Nothing happened? Close this page to return to the app.
        </p>
      </div>
    </main>
  );
}
