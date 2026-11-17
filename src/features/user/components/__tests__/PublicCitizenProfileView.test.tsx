import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import type { PublicCitizenProfile } from "@/shared/api/citizen";
import PublicCitizenProfileView from "../PublicCitizenProfileView";

/**
 * A public passport profile opens on Republic Activity (the person's posts),
 * and that tab is the leftmost one (app#306). With no posts it shows the
 * empty state rather than falling back to another tab.
 */

const profile = vi.hoisted(() => ({ current: null as unknown }));
vi.mock("@/shared/api/citizen", () => ({
  fetchPublicCitizenProfile: async () => profile.current,
}));
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "u1" }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));
vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: (select?: (s: unknown) => unknown) => {
    const state = { user: { id: "viewer" } };
    return select ? select(state) : state;
  },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function makeProfile(
  overrides: Partial<PublicCitizenProfile> = {},
): PublicCitizenProfile {
  return {
    id: "u1",
    name: "Ana",
    username: "ana",
    roleType: [],
    systemRole: "user",
    createdAt: "2025-01-01T00:00:00.000Z",
    passport: {
      id: "p1",
      perks: [],
      paths: [],
      stamps: [
        {
          id: "s1",
          venueId: null,
          venue: { name: "Fox Hall", city: "Manila" },
        },
      ],
      userBadges: [],
    },
    posts: [
      {
        id: "post1",
        type: "experience",
        content: "Loved the jazz night",
        createdAt: "2026-11-01T00:00:00.000Z",
        mediaUrls: [],
        likesCount: 2,
        commentsCount: 1,
      },
    ],
    ...overrides,
  } as unknown as PublicCitizenProfile;
}

function renderProfile() {
  return render(
    createElement(
      QueryClientProvider,
      {
        client: new QueryClient({
          defaultOptions: { queries: { retry: false } },
        }),
      },
      createElement(PublicCitizenProfileView),
    ),
  );
}

/** The tab strip is the row of buttons containing "Republic Activity". */
async function tabButtons() {
  const activity = await screen.findByRole("button", {
    name: /republic activity/i,
  });
  return within(activity.parentElement as HTMLElement).getAllByRole("button");
}

describe("PublicCitizenProfileView default tab", () => {
  beforeEach(() => {
    profile.current = makeProfile();
  });

  it("puts Republic Activity first, then Venue Stamps and Milestone Badges", async () => {
    renderProfile();
    const names = (await tabButtons()).map((b) => b.textContent ?? "");
    expect(names[0]).toMatch(/republic activity/i);
    expect(names[1]).toMatch(/venue stamps/i);
    expect(names[2]).toMatch(/milestone badges/i);
  });

  it("opens on Republic Activity and shows the person's posts", async () => {
    renderProfile();
    const [first] = await tabButtons();
    expect(first).toHaveClass("text-lime-400");
    expect(screen.getByText("Loved the jazz night")).toBeInTheDocument();
    expect(screen.queryByText("Fox Hall")).not.toBeInTheDocument();
  });

  it("shows the empty state when the person has no posts", async () => {
    profile.current = makeProfile({ posts: [] });
    renderProfile();
    expect(
      await screen.findByText("No Republic Posts Yet"),
    ).toBeInTheDocument();
  });

  it("still switches to Venue Stamps on click", async () => {
    renderProfile();
    fireEvent.click(
      await screen.findByRole("button", { name: /venue stamps/i }),
    );
    expect(screen.getByText("Fox Hall")).toBeInTheDocument();
    expect(screen.queryByText("Loved the jazz night")).not.toBeInTheDocument();
  });
});
