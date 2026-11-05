import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// The console section comes from the URL (`/admin/[section]`).
const nav = vi.hoisted(() => ({ section: undefined as string | undefined }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => (nav.section ? `/admin/${nav.section}` : "/admin"),
  useParams: () => (nav.section ? { section: nav.section } : {}),
}));
vi.mock("@/shared/auth/useLogout", () => ({ useLogout: () => vi.fn() }));
vi.mock("@/shared/components/layout/BrandLogo", () => ({
  BrandLogo: () => null,
}));
vi.mock("@/shared/components/layout/UserMenuButton", () => ({
  default: ({ showAppNav }: { showAppNav?: boolean }) => (
    <div data-testid="user-menu" data-app-nav={String(!!showAppNav)} />
  ),
}));

// AdminContent's tabs, stubbed: only whether each renders matters here.
vi.mock("@/features/admin/components", () => {
  const stub = (name: string) => {
    const Stub = () => <div data-testid={name} />;
    Stub.displayName = name;
    return Stub;
  };
  return {
    AdminKPISection: stub("kpis"),
    AdminChartsSection: stub("charts"),
    AdminSubmissionsTable: stub("role-applications"),
    AdminBookingsTable: stub("bookings"),
    AdminVenuesTable: stub("venues"),
    AdminVenuesMap: stub("map"),
    AdminEventsTable: stub("events"),
    AdminCategoriesTable: stub("categories"),
    AdminCitizenTable: stub("citizens"),
    AdminAssetsTable: stub("assets"),
    AdminServicesTable: stub("services"),
    AdminCancellationPolicies: stub("policies"),
    AdminPlatformFeeConfigs: stub("fees"),
    AdminPromotions: stub("promotions"),
    AdminDisputesPanel: stub("disputes"),
    AdminReviewPanel: stub("review"),
    AdminReportsPanel: stub("reports"),
    AdminIdentityPanel: stub("identity"),
  };
});
vi.mock("@/features/admin/hooks/useAdminData", () => ({
  useAdminData: () => ({ data: undefined, isLoading: false }),
}));
vi.mock("@/features/admin/hooks/useAdminPendingVenues", () => ({
  useAdminPendingVenues: () => ({ venues: [], isLoading: false }),
}));
vi.mock("@/features/admin/hooks/useAdminPendingAssets", () => ({
  useAdminPendingAssets: () => ({ assets: [], isLoading: false }),
}));
vi.mock("@/features/admin/hooks/useAdminPendingServices", () => ({
  useAdminPendingServices: () => ({ services: [], isLoading: false }),
}));

import { useAuthStore } from "@/shared/auth/useAuthStore";
import { AdminContent } from "@/features/admin/components/AdminContent";
import { AdminSidebar } from "@/features/admin/components/AdminSidebar";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { AdminBody } from "@/features/admin/components/AdminBody";

const SECRETARY = [
  "admin:access",
  "queue:read",
  "queue:decide",
  "content:moderate",
];
const ADMIN = [
  "admin:access",
  "queue:read",
  "queue:decide",
  "roles:manage",
  "refunds:manage",
  "bookings:read:all",
];

const signIn = (systemRole: string, permissions: string[]) =>
  useAuthStore.getState().login({
    user: {
      id: "a1",
      email: "a@example.com",
      name: "Ada",
      systemRole,
      roleType: [],
      permissions,
    } as never,
  });

const renderContent = () =>
  render(
    <AdminContent
      stats={{}}
      venues={[]}
      events={[]}
      categories={[]}
      citizens={[]}
      assets={[]}
      services={[]}
      bookings={{ serviceBookings: [], assetBookings: [], eventBookings: [] }}
    />,
  );

/**
 * The admin secretary holds only the queue permissions. Controls whose API
 * routes need more used to render for them and fail.
 */
describe("admin console visibility", () => {
  beforeEach(() => {
    nav.section = undefined;
  });

  it("hides role applications from the secretary (roles:manage)", () => {
    signIn("admin_secretary", SECRETARY);
    renderContent();
    expect(screen.queryByTestId("role-applications")).toBeNull();
    expect(screen.getByTestId("kpis")).toBeInTheDocument();
  });

  it("shows role applications to an admin", () => {
    signIn("admin", ADMIN);
    renderContent();
    expect(screen.getByTestId("role-applications")).toBeInTheDocument();
  });

  it("links Refunds only for refunds:manage", () => {
    signIn("admin_secretary", SECRETARY);
    const { unmount } = render(<AdminSidebar />);
    expect(screen.queryByText("Refunds")).toBeNull();
    expect(screen.getByText("Secretary")).toBeInTheDocument();
    unmount();

    signIn("admin", ADMIN);
    render(<AdminSidebar />);
    expect(screen.getByRole("link", { name: /Refunds/ })).toHaveAttribute(
      "href",
      "/admin/refunds",
    );
  });

  it("gives the admin header the user menu, with the shared pages", () => {
    signIn("admin", ADMIN);
    render(<AdminHeader />);
    expect(screen.getByTestId("user-menu")).toHaveAttribute(
      "data-app-nav",
      "true",
    );
  });

  it("links every section to its own URL and marks the current one", () => {
    signIn("admin", ADMIN);
    nav.section = "bookings";
    render(<AdminSidebar />);
    expect(screen.getByRole("link", { name: /Dashboard/ })).toHaveAttribute(
      "href",
      "/admin",
    );
    const bookings = screen.getByRole("link", { name: /Bookings/ });
    expect(bookings).toHaveAttribute("href", "/admin/bookings");
    expect(bookings).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /Venues/ })).toHaveAttribute(
      "href",
      "/admin/venues",
    );
    expect(
      screen.getByRole("link", { name: /Venues/ }),
    ).not.toHaveAttribute("aria-current");
  });

  it("renders the section named in the URL", () => {
    signIn("admin", ADMIN);
    nav.section = "venues";
    renderContent();
    expect(screen.getByTestId("venues")).toBeInTheDocument();
    expect(screen.queryByTestId("kpis")).toBeNull();
  });

  it("shows Settings as not yet available rather than a placeholder", () => {
    signIn("admin", ADMIN);
    nav.section = "settings";
    renderContent();
    expect(screen.getByText("Not yet available")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Back to dashboard/ }),
    ).toHaveAttribute("href", "/admin");
  });

  it("fills the width with the phone/tablet overview on the dashboard", () => {
    // In the console's flex row, an overview without flex-1 shrank to its
    // content's width: a narrow column beside empty space below lg.
    render(
      <AdminBody
        overview={<div data-testid="overview" />}
        content={<div data-testid="content" />}
      />,
    );
    expect(screen.getByTestId("overview").parentElement).toHaveClass(
      "lg:hidden",
      "flex-1",
      "min-w-0",
    );
    expect(screen.getByTestId("content").parentElement).toHaveClass(
      "hidden",
      "lg:flex",
      "flex-1",
      "min-w-0",
    );
  });

  it("shows the section content full width off the dashboard", () => {
    nav.section = "citizens";
    render(
      <AdminBody
        overview={<div data-testid="overview" />}
        content={<div data-testid="content" />}
      />,
    );
    expect(screen.queryByTestId("overview")).toBeNull();
    const wrapper = screen.getByTestId("content").parentElement;
    expect(wrapper).toHaveClass("flex", "flex-1", "min-w-0");
    expect(wrapper).not.toHaveClass("hidden");
  });

  it("titles every tab instead of falling back to Dashboard", () => {
    signIn("admin", ADMIN);
    nav.section = "platform-fees";
    render(<AdminHeader />);
    expect(
      screen.getByRole("heading", { name: "Platform Fees" }),
    ).toBeInTheDocument();
  });
});
