import { describe, it, expect, vi } from "vitest";

vi.mock(
  "@/features/role-application/components/FoxerApplicationClient",
  () => ({ default: () => null }),
);
// The page checks the visitor is signed in first.
vi.mock("@/shared/lib/server/auth", () => ({ requireAuth: vi.fn() }));

import {
  ROLES as CATALOG,
  PROVIDER_SUBSECTIONS,
} from "@/shared/data/roleCatalog";
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
    expect(ROLE_BADGE.providerFoxer.label).toBe("Provider Foxer");
    expect(ROLE_BADGE.eventFoxer.label).toBe("Event Foxer");
    expect(ROLE_BADGE.venueFoxer.label).toBe("Venue Foxer");
    expect(ROLE_BADGE.organizer.label).toBe("Event Coordinator");
  });

  it("are not offered in the role catalog, which lists only the 3 main Foxer roles", () => {
    const offered = CATALOG.map((r) => r.roleType);
    expect(offered).toEqual(["providerFoxer", "venueFoxer", "eventFoxer"]);
    for (const roleType of RETIRED) expect(offered).not.toContain(roleType);
    expect(PROVIDER_SUBSECTIONS.map((s) => s.title)).toContain(
      "Event Coordinator",
    );
  });

  it("are not listed on the landing page", () => {
    const offered = LANDING.map((r) => r.roleType);
    expect(offered).toEqual(["eventFoxer", "venueFoxer", "providerFoxer"]);
    for (const roleType of RETIRED) expect(offered).not.toContain(roleType);
    expect(roleName("providerFoxer")).toBe("Provider Foxer");
    expect(roleName("organizer")).toBe("Event Coordinator");
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
