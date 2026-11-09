import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventCard } from "@/features/event/components/EventCard";
import type { EventTemplate } from "@/shared/api/event-templates";

vi.mock("next/image", () => ({
  default: ({ alt, fill: _fill, sizes: _sizes, ...props }: any) => (
    <img alt={alt ?? ""} {...props} />
  ),
}));

// Money reads the currency context; the amount itself is not under test.
vi.mock("@/shared/components/ui/Money", () => ({
  Money: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

vi.mock("@/shared/api/favorites", () => ({
  addFavorite: vi.fn(),
  removeFavoriteByListing: vi.fn(),
}));

/** The shape /event-templates/browse returns (a dev seed row). */
const template = (overrides: Partial<EventTemplate> = {}): EventTemplate =>
  ({
    id: "seed-template-bulk-birthday-cebu-4",
    name: "Fiesta Birthday Cebu 2",
    category: "birthday",
    targetCity: "Cebu City",
    targetState: "Cebu",
    targetCountry: "Philippines",
    images: [{ url: "https://images.example.com/fiesta.jpg" }],
    templateVenues: [{ venue: { city: "Lapu-Lapu", price: 1000 } }],
    estimatedTotal: 25000,
    ...overrides,
  }) as EventTemplate;

/**
 * app#260: the Categories page lists packages (event templates), but the card
 * read an older event shape, so every card linked to a 404 under /venues, had
 * no title, said "Location TBD", and showed the same fallback photo.
 */
describe("EventCard on the Categories page", () => {
  it("links to the package's own event page", () => {
    render(<EventCard event={template()} />);
    expect(screen.getByRole("link").getAttribute("href")).toBe(
      "/event/seed-template-bulk-birthday-cebu-4",
    );
  });

  it("shows the package's own title, photo and location", () => {
    render(<EventCard event={template()} />);
    expect(
      screen.getByRole("heading", { name: "Fiesta Birthday Cebu 2" }),
    ).toBeTruthy();
    expect(
      screen.getByAltText("Fiesta Birthday Cebu 2").getAttribute("src"),
    ).toBe("https://images.example.com/fiesta.jpg");
    expect(screen.getByText("Cebu City, Cebu")).toBeTruthy();
  });

  it("gives each package its own photo", () => {
    render(
      <>
        <EventCard event={template()} />
        <EventCard
          event={template({
            id: "seed-template-2",
            name: "Wedding Tagaytay",
            images: [{ url: "https://images.example.com/wedding.jpg" }] as any,
          })}
        />
      </>,
    );
    expect(screen.getByAltText("Wedding Tagaytay").getAttribute("src")).toBe(
      "https://images.example.com/wedding.jpg",
    );
    expect(
      screen.getByAltText("Fiesta Birthday Cebu 2").getAttribute("src"),
    ).toBe("https://images.example.com/fiesta.jpg");
  });

  it("falls back to a venue's city when the package has no target city", () => {
    render(
      <EventCard
        event={template({ targetCity: undefined, targetState: undefined })}
      />,
    );
    expect(screen.getByText("Lapu-Lapu")).toBeTruthy();
  });

  it('says "Location TBD" only when there is no city at all', () => {
    render(
      <EventCard
        event={template({
          targetCity: undefined,
          targetState: undefined,
          templateVenues: [],
        })}
      />,
    );
    expect(screen.getByText("Location TBD")).toBeTruthy();
  });
});
