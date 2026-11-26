import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HostServicesClient from "@/features/dashboard/components/HostServicesClient";
import { PerformersSection } from "@/features/dashboard/components/PerformersSection";

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => router,
  // Performer gigs are the Services page's Performers tab (app#437).
  useSearchParams: () => new URLSearchParams("tab=performers"),
}));

// The header loads the session and navigation; it is not under test.
vi.mock("@/features/dashboard/components/DashboardHeader", () => ({
  DashboardHeader: () => null,
  WelcomeBanner: () => null,
}));

/**
 * app#326: every "add a gig" button opens the Studio for a gig, which offers
 * the performer categories. (`create-listing?type=service` offers only the
 * operational ones.)
 */
const GIG_STUDIO = "/foxer/create-service?type=performer";

describe("adding a performer gig", () => {
  it("Add Performer Gig on the Performers tab opens the Gig Studio", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <HostServicesClient initialServices={[]} />
      </QueryClientProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Add Performer Gig/ }));
    expect(router.push).toHaveBeenCalledWith(GIG_STUDIO);
  });

  it("the empty Performers list links to the Gig Studio", () => {
    render(<PerformersSection services={[]} onStatusChange={() => {}} />);
    expect(
      screen
        .getAllByRole("link")
        .some((a) => a.getAttribute("href") === GIG_STUDIO),
    ).toBe(true);
  });
});
