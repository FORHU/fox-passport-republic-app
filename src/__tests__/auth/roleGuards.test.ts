import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Role-specific pages have to refuse people without the role even when opened
 * by URL; hiding their links is courtesy, not the control. Several of these
 * needed only a sign-in (the Stripe pages, Partnerships, Affiliations,
 * Marketplace requests). `middlewareSecrets.test.ts` checks that every
 * protected tree requires a session; this checks the role on top of that.
 *
 * A source scan, like that one — comments stripped first, so a guard named in
 * prose doesn't count.
 */

const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

const root = process.cwd();
const tryRead = (rel: string) => {
  try {
    return stripComments(readFileSync(join(root, rel), "utf-8"));
  } catch {
    return "";
  }
};

const ROLE_GUARD =
  /requirePermission|requireAnyPermission|requireHost|requireAdmin|studioAccessDenied/;

// Each role-specific page, with the guard it must carry in its own page or
// layout (not a parent's, which only requires a session).
const ROLE_PAGES: [route: string, guard: RegExp][] = [
  ["creator-dashboard", /requireHost/],
  ["creator-dashboard/stripe-onboard", /requirePermission\("payouts:onboard"/],
  [
    "creator-dashboard/stripe-dashboard",
    /requirePermission\("payouts:onboard"/,
  ],
  ["creator-dashboard/earnings", /requirePermission\("payouts:onboard"/],
  ["creator-dashboard/partnerships", /requireAnyPermission/],
  ["creator-dashboard/events", ROLE_GUARD],
  ["creator-dashboard/venues", ROLE_GUARD],
  ["creator-dashboard/assets", ROLE_GUARD],
  ["creator-dashboard/services", ROLE_GUARD],
  ["creator-dashboard/performers", ROLE_GUARD],
  ["creator-dashboard/promotions", ROLE_GUARD],
  ["creator-dashboard/team", /requireHost/],
  ["creator-dashboard/venues/[id]/edit", /studioAccessDenied\("venue"\)/],
  ["foxer/affiliations", /requirePermission\("template:manage"/],
  ["foxer/marketplace-requests", /requireAnyPermission/],
  ["foxer/create-investment", ROLE_GUARD],
  ["admin", /requireAdmin/],
  ["admin/refunds", /requirePermission\("refunds:manage"/],
];

describe("role-specific pages guard their role", () => {
  it.each(ROLE_PAGES)("%s", (route, guard) => {
    const dir = join("src", "app", ...route.split("/"));
    const source =
      tryRead(join(dir, "page.tsx")) + tryRead(join(dir, "layout.tsx"));
    expect(source, `no page or layout found for ${route}`).not.toBe("");
    expect(source).toMatch(guard);
  });
});

describe("the proxy's protected routes", () => {
  const proxy = tryRead("src/proxy.ts");

  it("include /messages, which had no guard at all", () => {
    expect(proxy).toMatch(/"\/messages"/);
  });

  it("no longer list the removed /mayor area", () => {
    expect(proxy).not.toMatch(/"\/mayor"/);
  });
});
