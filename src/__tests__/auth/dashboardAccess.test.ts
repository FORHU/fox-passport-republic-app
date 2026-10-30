import { describe, it, expect } from "vitest";
import { canAccessCreatorDashboard } from "@/shared/lib/dashboard-path";
import type { User } from "@/shared/auth/types";

const user = (u: Partial<User>) => ({ systemRole: "user", ...u }) as User;

/**
 * One rule for who may open the creator dashboard, shared by `requireHost`,
 * the user menu and sign-in landing.
 */
describe("canAccessCreatorDashboard", () => {
  it.each([
    "venueFoxer",
    "eventFoxer",
    "performerFoxer",
    "investor",
    "organizer",
  ])("lets a %s in", (role) => {
    expect(canAccessCreatorDashboard(user({ roleType: [role as never] }))).toBe(
      true,
    );
  });

  it("lets an admin in through the all-bookings override", () => {
    expect(
      canAccessCreatorDashboard(
        user({
          systemRole: "admin",
          roleType: [],
          permissions: ["admin:access", "bookings:read:all"],
        }),
      ),
    ).toBe(true);
  });

  it("keeps out a plain citizen", () => {
    expect(canAccessCreatorDashboard(user({ roleType: [] }))).toBe(false);
  });

  it("keeps out an admin secretary, who has no override", () => {
    expect(
      canAccessCreatorDashboard(
        user({
          systemRole: "admin_secretary",
          roleType: [],
          permissions: ["admin:access", "queue:read", "queue:decide"],
        }),
      ),
    ).toBe(false);
  });

  it("keeps out a signed-out visitor", () => {
    expect(canAccessCreatorDashboard(null)).toBe(false);
  });
});
