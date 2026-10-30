"use client";

import { useAuthStore } from "@/shared/auth/useAuthStore";

/** The footer's Account links. "Sign in" only for someone signed out: for a
 * signed-in user /auth was just another Sign-in button. */
export function LandingFooterAccountLinks() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const items = [
    ...(!isLoading && !isAuthenticated
      ? [{ label: "Sign in", href: "/auth" }]
      : []),
    // Public, unlike /onboarding; the role docs' sidebar lists every role.
    { label: "Become a Foxer", href: "/earn/event" },
  ];

  return (
    <ul className="space-y-2 sm:space-y-4">
      {items.map((item) => (
        <li key={item.label}>
          <a
            className="text-xs text-gray-400 hover:text-accent font-medium transition-colors"
            href={item.href}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
