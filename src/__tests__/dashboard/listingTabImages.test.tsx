import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement, ReactNode } from "react";

/**
 * app#437: the Services tab showed an empty space where each service's picture
 * should be, and the Assets tab showed only the placeholder box. Their pages
 * passed the raw API listings to the lists, which read the dashboard shape
 * (`img`, plus `icon`, `color` and `priceUnit` for services) that only the
 * Overview built. The Services, Performers and Assets pages now map on the
 * server, like the Overview.
 */

const getServicesByHostId = vi.fn();
const getAssetsByHostId = vi.fn();

vi.mock("@/shared/lib/server/auth", () => ({
  requireAnyPermission: vi.fn(async () => ({ id: "host-1" })),
  requirePermission: vi.fn(async () => ({ id: "host-1" })),
}));
vi.mock("@/shared/lib/server/data", () => ({
  getServicesByHostId: (...args: unknown[]) => getServicesByHostId(...args),
  getAssetsByHostId: (...args: unknown[]) => getAssetsByHostId(...args),
}));
vi.mock("@/shared/auth/RequireAuth", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const searchParams = new URLSearchParams();
const redirect = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => searchParams,
  redirect: (url: string) => redirect(url),
}));
vi.mock("next/image", () => ({
  default: ({ alt, fill: _fill, ...props }: any) => (
    <img alt={alt ?? ""} {...props} />
  ),
}));
// The header loads the session and navigation; it is not under test.
vi.mock("@/features/dashboard/components/DashboardHeader", () => ({
  DashboardHeader: () => null,
  WelcomeBanner: () => null,
}));
vi.mock("@/shared/components/ui/Money", () => ({
  Money: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

// Imported once, up front (the mocks above are hoisted): importing a page
// inside each test is slow enough under the full suite to hit the 5s timeout.
import ServicesPage from "@/app/creator-dashboard/services/page";
import PerformersPage from "@/app/creator-dashboard/performers/page";
import AssetsPage from "@/app/creator-dashboard/assets/page";

const PICTURE = "https://cdn.example.com/services/lechon.jpg";

// Raw services as `GET /service?ownerId=` returns them.
const RAW = {
  withPicture: {
    id: "svc-1",
    name: "Cebu Lechon & Kamayan",
    price: "1200.00",
    billingRate: "daily",
    status: "available",
    category: "catering",
    images: [{ url: PICTURE }],
  },
  withoutPicture: {
    id: "svc-2",
    name: "Event Styling & Design",
    price: "18000.00",
    billingRate: "one_time",
    status: "available",
    category: "decoration",
    images: [],
  },
  band: {
    id: "svc-3",
    name: "Live Band Performance",
    price: "25000.00",
    billingRate: "hourly",
    status: "available",
    category: "live_band",
    images: [{ url: PICTURE }],
  },
};

async function renderPage(Page: () => Promise<unknown>) {
  const ui = (await Page()) as ReactElement;
  return render(
    <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>,
  );
}

beforeEach(() => {
  getServicesByHostId.mockReset();
  getAssetsByHostId.mockReset();
  redirect.mockReset();
  searchParams.delete("tab");
});

describe("Services tab (app#437)", () => {
  const load = ServicesPage;

  it("shows the uploaded picture from the service's images", async () => {
    getServicesByHostId.mockResolvedValue([RAW.withPicture]);
    await renderPage(load);

    expect(getServicesByHostId).toHaveBeenCalledWith("host-1");
    expect(
      screen.getByRole("img", { name: "Cebu Lechon & Kamayan" }),
    ).toHaveAttribute("src", PICTURE);
  });

  it("shows the category icon when there is no picture", async () => {
    getServicesByHostId.mockResolvedValue([RAW.withoutPicture]);
    await renderPage(load);

    expect(
      screen.queryByRole("img", { name: "Event Styling & Design" }),
    ).not.toBeInTheDocument();
    // `decoration` maps to the brush icon, shown large in the card's banner.
    expect(
      screen.getByText("brush", { selector: ".text-5xl" }),
    ).toBeInTheDocument();
  });

  it("shows the price unit, as on the Overview", async () => {
    getServicesByHostId.mockResolvedValue([RAW.withPicture]);
    await renderPage(load);

    expect(screen.getByText(/daily/)).toBeInTheDocument();
  });
});

describe("Performers tab (app#437)", () => {
  const load = ServicesPage;

  it("the old Performers address opens the Services page's Performers tab", async () => {
    await PerformersPage();

    expect(redirect).toHaveBeenCalledWith(
      "/creator-dashboard/services?tab=performers",
    );
  });

  it("lists gigs only, as cards with their picture", async () => {
    searchParams.set("tab", "performers");
    getServicesByHostId.mockResolvedValue([RAW.band, RAW.withPicture]);
    await renderPage(load);

    expect(
      screen.getByRole("heading", { name: /Performer Gigs/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Live Band Performance" }),
    ).toHaveAttribute("src", PICTURE);
    // app#325: catering stays on the Operational Services tab.
    expect(screen.queryByText("Cebu Lechon & Kamayan")).not.toBeInTheDocument();
  });

  it("a gig card looks like a service card", async () => {
    searchParams.set("tab", "performers");
    getServicesByHostId.mockResolvedValue([RAW.band]);
    await renderPage(load);
    const gigCard = screen
      .getByRole("img", { name: "Live Band Performance" })
      .closest("[class*='rounded-2xl']")!.className;
    cleanup();

    searchParams.set("tab", "services");
    getServicesByHostId.mockResolvedValue([RAW.withPicture]);
    await renderPage(load);
    const serviceCard = screen
      .getByRole("img", { name: "Cebu Lechon & Kamayan" })
      .closest("[class*='rounded-2xl']")!.className;

    expect(gigCard).toBe(serviceCard);
  });
});

describe("Assets tab (app#437)", () => {
  const load = AssetsPage;
  const GEAR_PICTURE = "https://cdn.example.com/assets/speaker.jpg";

  // Raw asset as `GET /asset?ownerId=` returns it.
  const asset = (images: { url: string }[]) => ({
    id: "gear-1",
    name: "Abdul Jabahr",
    category: "SOUND_SYSTEM",
    status: "available",
    images,
  });

  // The tile picture is decorative (the name is printed under it), so it has
  // an empty alt and is found by tag.
  const tilePicture = (container: HTMLElement) =>
    container.querySelector("#inventory img");

  it("shows the uploaded picture from the asset's images", async () => {
    getAssetsByHostId.mockResolvedValue([asset([{ url: GEAR_PICTURE }])]);
    const { container } = await renderPage(load);

    expect(getAssetsByHostId).toHaveBeenCalledWith("host-1");
    expect(tilePicture(container)).toHaveAttribute("src", GEAR_PICTURE);
    expect(
      screen.queryByText("inventory_2", { selector: ".text-5xl" }),
    ).toBeNull();
  });

  it("shows the placeholder box when there is no picture", async () => {
    getAssetsByHostId.mockResolvedValue([asset([])]);
    const { container } = await renderPage(load);

    expect(tilePicture(container)).toBeNull();
    expect(
      screen.getByText("inventory_2", { selector: ".text-5xl" }),
    ).toBeInTheDocument();
  });

  it("falls back to the placeholder box when the picture fails to load", async () => {
    getAssetsByHostId.mockResolvedValue([asset([{ url: GEAR_PICTURE }])]);
    const { container } = await renderPage(load);

    fireEvent.error(tilePicture(container)!);

    expect(tilePicture(container)).toBeNull();
    expect(
      screen.getByText("inventory_2", { selector: ".text-5xl" }),
    ).toBeInTheDocument();
  });

  it("keeps the category label and the status", async () => {
    getAssetsByHostId.mockResolvedValue([asset([])]);
    await renderPage(load);

    expect(screen.getByText("SOUND_SYSTEM")).toBeInTheDocument();
    expect(screen.getByText(/^available$/i)).toBeInTheDocument();
  });
});
