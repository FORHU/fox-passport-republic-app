import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

import AppHandoff, {
  APP_LINKS,
} from "@/app/stripe-connect/_components/AppHandoff";

/**
 * mobile#476: Stripe sends a person who set up payouts from the app to these
 * pages, which must hand off to the app's own link straight away and offer a
 * button when the browser won't follow it.
 */
describe("AppHandoff", () => {
  const replace = vi.fn();
  const original = window.location;

  beforeEach(() => {
    replace.mockReset();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...original, replace },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: original,
    });
  });

  it.each([
    ["return", "foxpassport://app/stripe/return", /payout setup saved/i],
    ["refresh", "foxpassport://app/stripe/refresh", /link has expired/i],
  ] as const)(
    "%s: redirects to the app and shows a button to it",
    (step, link, heading) => {
      render(<AppHandoff step={step} />);

      expect(APP_LINKS[step]).toBe(link);
      expect(replace).toHaveBeenCalledWith(link);
      expect(
        screen.getByRole("heading", { name: heading }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /open foxpassport/i }),
      ).toHaveAttribute("href", link);
    },
  );
});
