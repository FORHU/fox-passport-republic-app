import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HostPerformersClient from "@/features/dashboard/components/HostPerformersClient";
import type { ServiceItem } from "@/features/dashboard/data/dashboardData";

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

vi.mock("@/shared/components/ui/Money", () => ({
  Money: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

/**
 * app#325: the Performers page lists performer gigs only. Catering and
 * staffing stay on the Services page.
 */

function service(overrides: Partial<ServiceItem>): ServiceItem {
  return {
    id: "s1",
    name: "Service",
    price: 1000,
    status: "Available",
    icon: "theater_comedy",
    color: "",
    tags: [],
    ...overrides,
  };
}

const SERVICES = [
  service({ id: "p1", name: "Manila Event Photography", category: "photography" }),
  service({ id: "b1", name: "Live Band Performance", category: "live_band" }),
  service({
    id: "c1",
    name: "Metro Manila Premium Catering",
    category: "catering",
  }),
];

describe("HostPerformersClient", () => {
  it("lists performer gigs and leaves out catering", () => {
    render(<HostPerformersClient initialServices={SERVICES} />);
    expect(screen.getByText("Manila Event Photography")).toBeInTheDocument();
    expect(screen.getByText("Live Band Performance")).toBeInTheDocument();
    expect(
      screen.queryByText("Metro Manila Premium Catering"),
    ).not.toBeInTheDocument();
  });

  it("counts only performer gigs in the stats strip", () => {
    render(<HostPerformersClient initialServices={SERVICES} />);
    const total = screen.getByText("Total Gigs").previousElementSibling;
    expect(total).toHaveTextContent("2");
    const available = screen.getByText("Available", {
      selector: ".text-xs.text-white\\/50",
    }).previousElementSibling;
    expect(available).toHaveTextContent("2");
  });
});
