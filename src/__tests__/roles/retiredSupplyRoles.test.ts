import { describe, it, expect, vi } from "vitest";

vi.mock(
  "@/features/role-application/components/FoxerApplicationClient",
  () => ({ default: () => null }),
);
// The page checks the visitor is signed in first.
vi.mock("@/shared/lib/server/auth", () => ({ requireAuth: vi.fn() }));

import { ROLES as CATALOG } from "@/shared/data/roleCatalog";
import { ROLES as LANDING, roleName } from "@/features/landing/journey/data";
import { ROLE_TYPES, FOXER_ROLES, ROLE_BADGE } from "@/shared/constants/roles";
import FoxerApplicationPage from "@/app/foxer/apply/page";

/**
 * Gear, Talent and Performer Foxer were folded into Provider (providerFoxer)
 * and removed everywhere (API ADR 0008, #258).
 */
const RETIRED = ["gearFoxer", "serviceFoxer", "performerFoxer"];

describe("retired supply roles", () => {
  it("are gone from the role types and Foxer roles", () => {
    for (const r of RETIRED) {
      expect(ROLE_TYPES as readonly string[]).not.toContain(r);
      expect(FOXER_ROLES as readonly string[]).not.toContain(r);
      expect(Object.keys(ROLE_BADGE)).not.toContain(r);
    }
    expect(ROLE_BADGE.providerFoxer.label).toBe("Provider");
  });

  it("are not offered in the role catalog", () => {
    const offered = CATALOG.map((r) => r.roleType);
    expect(offered).toContain("providerFoxer");
    for (const roleType of RETIRED) expect(offered).not.toContain(roleType);
  });

  it("are not listed on the landing page", () => {
    const offered = LANDING.map((r) => r.roleType);
    expect(offered).toContain("providerFoxer");
    for (const roleType of RETIRED) expect(offered).not.toContain(roleType);
    expect(roleName("providerFoxer")).toBe("Provider");
  });

  it.each(["asset", "service", "performer", undefined])(
    "open the Provider form for ?type=%s",
    async (type) => {
      const page = await FoxerApplicationPage({
        searchParams: Promise.resolve({ type }),
      });
      expect(page.props.initialType).toBe("provider");
    },
  );

  it("still opens the Organizer form for ?type=organizer", async () => {
    const page = await FoxerApplicationPage({
      searchParams: Promise.resolve({ type: "organizer" }),
    });
    expect(page.props.initialType).toBe("organizer");
  });
});
