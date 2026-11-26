import { describe, it, expect, vi, afterEach } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({ put: vi.fn() }));
vi.mock("@/shared/lib/axios", () => ({ default: api }));

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/image", () => ({
  default: ({ alt, fill: _fill, ...props }: any) => (
    <img src="mock.png" alt={alt ?? ""} {...props} />
  ),
}));

// The header loads the session and navigation; it is not under test.
vi.mock("@/features/dashboard/components/DashboardHeader", () => ({
  DashboardHeader: () => null,
  WelcomeBanner: () => null,
}));

vi.mock("@/shared/auth/RequireAuth", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/shared/auth/useRoleAccess", () => ({
  useRoleAccess: () => ({
    canManageServices: true,
    canManagePerformers: false,
  }),
}));

vi.mock("@/shared/components/ui/Money", () => ({
  Money: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

import HostAssetsClient from "@/features/dashboard/components/HostAssetsClient";
import HostServicesClient from "@/features/dashboard/components/HostServicesClient";
import type { ServiceItem } from "@/features/dashboard/data/dashboardData";

/**
 * app#328: picking a status from a listing card's badge saves it. The badge
 * changes only once the API has it; a failed save keeps the old status and
 * says why. Listings under review show a label, not a menu.
 */

function withQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

const gear = (status: string) => ({
  id: "a1",
  name: "Sony FX3",
  category: "camera",
  status,
  img: null,
});

function service(overrides: Partial<ServiceItem>): ServiceItem {
  return {
    id: "s1",
    name: "Event Coordination",
    price: 1000,
    status: "available",
    icon: "groups",
    color: "",
    category: "coordination",
    tags: [],
    ...overrides,
  };
}

/** The badge's menu button; the card around it is a button too. */
const badgeName = (label: string) => `${label} expand_more`;

/** Opens the card's badge (it shows `current`) and picks `option`. */
function pick(current: string, option: string) {
  fireEvent.click(screen.getByRole("button", { name: badgeName(current) }));
  fireEvent.click(screen.getByRole("button", { name: option }));
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("gear badge on My Assets", () => {
  it("saves Unavailable as archived, then shows it", async () => {
    api.put.mockResolvedValue({ data: {} });
    withQuery(<HostAssetsClient initialInventory={[gear("available")]} />);

    pick("Available", "unavailable");

    expect(api.put).toHaveBeenCalledWith("/asset/a1", { status: "archived" });
    expect(
      await screen.findByRole("button", { name: badgeName("Archived") }),
    ).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalled();
  });

  it("saves Reserved as reserved", async () => {
    api.put.mockResolvedValue({ data: {} });
    withQuery(<HostAssetsClient initialInventory={[gear("available")]} />);

    pick("Available", "reserved");

    expect(api.put).toHaveBeenCalledWith("/asset/a1", { status: "reserved" });
    expect(
      await screen.findByRole("button", { name: badgeName("Reserved") }),
    ).toBeInTheDocument();
  });

  it("keeps the old status and shows the API's message when the save fails", async () => {
    api.put.mockRejectedValue({
      response: { status: 400, data: { message: "Add at least one image" } },
    });
    withQuery(<HostAssetsClient initialInventory={[gear("available")]} />);

    pick("Available", "reserved");

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Add at least one image"),
    );
    expect(
      screen.getByRole("button", { name: badgeName("Available") }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: badgeName("Reserved") }),
    ).not.toBeInTheDocument();
  });

  it.each(["draft", "pending", "rejected"])(
    "shows a %s listing's status as a label, with no menu",
    (status) => {
      withQuery(<HostAssetsClient initialInventory={[gear(status)]} />);
      const label = screen.getByText(new RegExp(`^${status}$`, "i"));
      expect(label.closest("button")).toBeNull();
    },
  );
});

describe("service badge on Services", () => {
  it("saves Active as available", async () => {
    api.put.mockResolvedValue({ data: {} });
    withQuery(
      <HostServicesClient initialServices={[service({ status: "paused" })]} />,
    );

    pick("Paused", "active");

    expect(api.put).toHaveBeenCalledWith("/service/s1", {
      status: "available",
    });
    expect(
      await screen.findByRole("button", { name: badgeName("Available") }),
    ).toBeInTheDocument();
  });

  it("saves Paused as paused", async () => {
    api.put.mockResolvedValue({ data: {} });
    withQuery(<HostServicesClient initialServices={[service({})]} />);

    pick("Available", "paused");

    expect(api.put).toHaveBeenCalledWith("/service/s1", { status: "paused" });
    expect(
      await screen.findByRole("button", { name: badgeName("Paused") }),
    ).toBeInTheDocument();
  });

  it("shows a pending service's status as a label, with no menu", () => {
    withQuery(
      <HostServicesClient initialServices={[service({ status: "pending" })]} />,
    );
    expect(screen.getByText(/^Pending$/).closest("button")).toBeNull();
  });
});
