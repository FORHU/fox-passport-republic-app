import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

/**
 * QA (RBAC / UI): an Investor could open the Event, Venue and Service Studios
 * by typing their URLs. Each Studio now shows an access-denied page to anyone
 * signed in without its role. The API still refuses every save on its own.
 */

const mocks = vi.hoisted(() => ({ requireAuth: vi.fn() }));
vi.mock("@/shared/lib/server/auth", () => ({ requireAuth: mocks.requireAuth }));
vi.mock("@/app/foxer/create-listing/_components/ListingBuilderClient", () => ({
  default: () => <div>listing builder</div>,
}));
vi.mock("@/features/venue/components/VenueCreationClient", () => ({
  default: () => <div>venue builder</div>,
}));

import EventStudioLayout from "@/app/foxer/create-event/layout";
import ServiceStudioLayout from "@/app/foxer/create-service/layout";
import ListingBuilder from "@/app/foxer/create-listing/page";
import VenueFoxerCreateVenuePage from "@/app/venue-foxer/create-venue/page";

const INVESTOR = { permissions: ["partnership:propose", "payouts:onboard"] };
const as = (permissions: string[]) =>
  mocks.requireAuth.mockResolvedValue({ permissions });

const show = async (node: Promise<ReactNode>) => render(<>{await node}</>);
const studio = () => <div>studio page</div>;

beforeEach(() => {
  mocks.requireAuth.mockReset();
  mocks.requireAuth.mockResolvedValue(INVESTOR);
});

describe("an Investor opening a Studio by URL", () => {
  it.each([
    [
      "/foxer/create-event",
      () => EventStudioLayout({ children: studio() }),
      "Event Studio is for Event Foxers",
      "/creator-dashboard/apply",
    ],
    [
      "/foxer/create-service",
      () => ServiceStudioLayout({ children: studio() }),
      "Service Studio is for Talent or Performer Foxers",
      "/foxer/apply?type=service",
    ],
    [
      "/venue-foxer/create-venue",
      () => VenueFoxerCreateVenuePage(),
      "Venue Studio is for Venue Foxers",
      "/venue-foxer/apply",
    ],
    [
      "/foxer/create-listing",
      () => ListingBuilder({ searchParams: Promise.resolve({}) }),
      "Gear Studio is for Gear Foxers",
      "/foxer/apply?type=asset",
    ],
    [
      "/foxer/create-listing?type=service",
      () =>
        ListingBuilder({ searchParams: Promise.resolve({ type: "service" }) }),
      "Service Studio is for Talent or Performer Foxers",
      "/foxer/apply?type=service",
    ],
  ])(
    "%s shows access denied, with a way to apply",
    async (_url, open, heading, applyHref) => {
      await show(open());
      expect(screen.getByRole("heading", { name: heading })).toBeTruthy();
      expect(
        screen
          .getByRole("link", { name: /Apply to become/ })
          .getAttribute("href"),
      ).toBe(applyHref);
      expect(screen.queryByText(/studio page|builder/)).toBeNull();
    },
  );
});

describe("someone with the role", () => {
  it("opens the Event Studio as an Event Foxer", async () => {
    as(["template:manage"]);
    await show(EventStudioLayout({ children: studio() }));
    expect(screen.getByText("studio page")).toBeTruthy();
  });

  it("opens the Service Studio as a Performer Foxer", async () => {
    as(["performer:manage"]);
    await show(ServiceStudioLayout({ children: studio() }));
    expect(screen.getByText("studio page")).toBeTruthy();
  });

  it("opens the Venue Studio as a Venue Foxer", async () => {
    as(["venue:manage"]);
    await show(VenueFoxerCreateVenuePage());
    expect(screen.getByText("venue builder")).toBeTruthy();
  });

  it("opens the gear builder as a Gear Foxer, but not the service one", async () => {
    as(["asset:manage"]);
    await show(
      ListingBuilder({ searchParams: Promise.resolve({ type: "inventory" }) }),
    );
    expect(screen.getByText("listing builder")).toBeTruthy();

    await show(
      ListingBuilder({ searchParams: Promise.resolve({ type: "service" }) }),
    );
    expect(
      screen.getByRole("heading", { name: /Service Studio/ }),
    ).toBeTruthy();
  });
});

it("still sends a signed-out visitor away (requireAuth redirects)", async () => {
  mocks.requireAuth.mockImplementation(async () => {
    throw new Error("NEXT_REDIRECT");
  });
  await expect(EventStudioLayout({ children: studio() })).rejects.toThrow(
    "NEXT_REDIRECT",
  );
});
