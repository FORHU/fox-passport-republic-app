import { describe, it, expect } from "vitest";
import { getDashboardPath, getLandingPath } from "@/shared/lib/dashboard-path";

/**
 * A fresh sign-in lands a plain citizen on Foxers (/search), the default
 * entry in the user menu; their dashboard is Passport in the top bar.
 * Supply-side roles and admins still land on their own dashboard.
 */
describe("getLandingPath", () => {
  it("lands a citizen on Foxers", () => {
    expect(getLandingPath({ systemRole: "user", roleType: [] })).toBe(
      "/search",
    );
  });

  it("lands a Foxer on the creator dashboard", () => {
    expect(
      getLandingPath({ systemRole: "user", roleType: ["venueFoxer"] }),
    ).toBe("/creator-dashboard");
  });

  it("lands an investor-only user on the creator dashboard overview", () => {
    expect(getLandingPath({ systemRole: "user", roleType: ["investor"] })).toBe(
      "/creator-dashboard",
    );
  });

  it("lands a Foxer who also invests on the creator dashboard", () => {
    expect(
      getLandingPath({
        systemRole: "user",
        roleType: ["investor", "venueFoxer"],
      }),
    ).toBe("/creator-dashboard");
  });

  it("lands an admin on the admin dashboard", () => {
    // Admin access is the server-granted permission, not the role name.
    const admin = {
      systemRole: "admin",
      roleType: [],
      permissions: ["admin:access"],
    } as const;
    expect(getLandingPath(admin as never)).toBe("/admin");
  });

  it("leaves the citizen's 'Go to dashboard' target alone", () => {
    expect(getDashboardPath({ systemRole: "user", roleType: [] })).toBe(
      "/user",
    );
  });
});
