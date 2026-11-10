/**
 * While their data loads, these components must not show an empty state, a
 * zero, or a default value (issue #271): they draw a skeleton, or hold their
 * controls, until the data arrives.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AvailabilityCalendar from "@/shared/components/ui/AvailabilityCalendar";
import { UserSavedVibes } from "@/features/user/components/citizen/UserSavedVibes";
import PassportBookletCard from "@/features/gamification/components/PassportBookletCard";

const calendarState = vi.hoisted(() => ({
  bookings: [] as unknown[],
  isLoading: true,
  error: null as unknown,
}));
vi.mock("@/shared/hooks/useCalendarBookings", () => ({
  useCalendarBookings: () => calendarState,
}));

const authState = vi.hoisted(() => ({ user: null as unknown }));
vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: (select?: (s: typeof authState) => unknown) =>
    select ? select(authState) : authState,
  onAccountChange: vi.fn(),
}));
vi.mock("@/shared/auth/returnTo", () => ({ signInThen: vi.fn() }));

const apiGet = vi.hoisted(() => vi.fn());
vi.mock("@/shared/lib/axios", () => ({ default: { get: apiGet } }));

const getSavedPosts = vi.hoisted(() => vi.fn());
vi.mock("@/shared/api/feed", () => ({ getSavedPosts }));
vi.mock("@/features/landing/components/sections/LandingHeader", () => ({
  default: () => null,
}));

import { CalendarView } from "@/shared/components/calendar/CalendarView";
import RoleDocs from "@/features/landing/journey/RoleDocs";
import SavedPostsPage from "@/app/republic/saved/page";

describe("AvailabilityCalendar", () => {
  it("can't be picked from while booked dates load", () => {
    const onChange = vi.fn();
    render(
      <AvailabilityCalendar
        mode="single"
        value=""
        onChange={onChange}
        bookedDates={[]}
        loading
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Checking availability",
    );
    const days = screen
      .getAllByRole("button")
      .filter((b) => /^\d+$/.test(b.textContent ?? ""));
    expect(days.length).toBeGreaterThan(27);
    for (const day of days) expect(day).toBeDisabled();
  });

  it("is pickable once loaded", () => {
    render(
      <AvailabilityCalendar
        mode="single"
        value=""
        onChange={vi.fn()}
        bookedDates={[]}
      />,
    );
    expect(screen.queryByText(/Checking availability/)).toBeNull();
    const days = screen
      .getAllByRole("button")
      .filter((b) => /^\d+$/.test(b.textContent ?? ""));
    expect(days.some((d) => !(d as HTMLButtonElement).disabled)).toBe(true);
  });
});

describe("UserSavedVibes", () => {
  it("draws rows, not 'Nothing saved yet', while loading", () => {
    render(<UserSavedVibes savedVibes={[]} loading />);
    expect(
      screen.getByRole("status", { name: "Loading saved items" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Nothing saved yet")).toBeNull();
  });

  it("shows the empty state once loaded with nothing saved", () => {
    render(<UserSavedVibes savedVibes={[]} />);
    expect(screen.getByText("Nothing saved yet")).toBeInTheDocument();
  });
});

describe("PassportBookletCard", () => {
  it("doesn't claim Lvl 1 before the level is known", () => {
    render(<PassportBookletCard user={{ name: "Ana" }} level={1} loading />);
    expect(screen.queryByText(/Lvl/)).toBeNull();
    expect(
      screen.getByRole("status", { name: "Loading level" }),
    ).toBeInTheDocument();
  });

  it("shows the level once loaded", () => {
    render(<PassportBookletCard user={{ name: "Ana" }} level={4} />);
    expect(screen.getByText("Lvl 4")).toBeInTheDocument();
  });
});

describe("CalendarView agenda (phone)", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia;
  });

  it("doesn't say nothing is booked while loading", async () => {
    calendarState.isLoading = true;
    render(<CalendarView />);
    expect(
      await screen.findByRole("status", { name: "Loading bookings" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Nothing booked/)).toBeNull();
  });

  it("says nothing is booked once loaded empty", async () => {
    calendarState.isLoading = false;
    render(<CalendarView />);
    expect(await screen.findByText(/Nothing booked/)).toBeInTheDocument();
  });
});

describe("RoleDocs CTA", () => {
  beforeEach(() => {
    authState.user = { id: "u1", roleType: ["user"] };
    apiGet.mockReset();
  });

  it("holds the CTA's place until applications load", () => {
    apiGet.mockReturnValue(new Promise(() => {}));
    render(<RoleDocs slug="venue" />);
    expect(
      screen.getByRole("status", { name: "Checking your applications" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Apply as/ })).toBeNull();
  });

  it("shows Apply once there's no pending application", async () => {
    apiGet.mockResolvedValue({ data: { data: [] } });
    render(<RoleDocs slug="venue" />);
    expect(
      await screen.findByRole("link", { name: /Apply as/ }),
    ).toBeInTheDocument();
  });
});

describe("Saved posts page", () => {
  it("shows an error, not 'Nothing saved yet', when the load fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    getSavedPosts.mockRejectedValue(new Error("network"));
    render(<SavedPostsPage />);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Couldn't load your saved posts",
      ),
    );
    expect(screen.queryByText("Nothing saved yet")).toBeNull();
  });
});
