import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventVenueOverview } from "../EventVenueOverview";

/**
 * The public event page hides empty blocks; only the builder preview
 * (`?preview=1`) shows "set this in the builder" hints.
 */

vi.mock("@/shared/components/ui/LocationMap", () => ({
  LocationMap: ({
    lat,
    lng,
    approximate,
  }: {
    lat: number;
    lng: number;
    approximate?: boolean;
  }) => (
    <div data-testid="map" data-approximate={String(!!approximate)}>
      {`${lat},${lng}`}
    </div>
  ),
}));

const BUILDER_MAP_HINT = /set a location in the builder/i;

describe("EventVenueOverview", () => {
  it("public page with a city but no coordinates shows the city, not the builder hint", () => {
    render(<EventVenueOverview location="Cebu City, Cebu" />);
    expect(screen.getByText(/where you.ll be/i)).toBeInTheDocument();
    expect(screen.getByText("Cebu City, Cebu")).toBeInTheDocument();
    expect(screen.queryByText(BUILDER_MAP_HINT)).not.toBeInTheDocument();
    expect(screen.queryByTestId("map")).not.toBeInTheDocument();
  });

  it("public page with no city and no coordinates hides the section", () => {
    render(<EventVenueOverview description="A day out." />);
    expect(screen.queryByText(/where you.ll be/i)).not.toBeInTheDocument();
  });

  it("builder preview with no coordinates keeps the builder hint", () => {
    render(<EventVenueOverview location="Cebu City, Cebu" isPreview />);
    expect(screen.getByText(BUILDER_MAP_HINT)).toBeInTheDocument();
  });

  it("renders the map when coordinates exist, including 0", () => {
    render(<EventVenueOverview mapLat={0} mapLng={123.9} />);
    expect(screen.getByTestId("map")).toHaveTextContent("0,123.9");
    expect(screen.queryByText(BUILDER_MAP_HINT)).not.toBeInTheDocument();
  });

  it("exact coordinates show a pinned map with the exact-location badge", () => {
    render(<EventVenueOverview mapLat={10.3} mapLng={123.9} />);
    expect(screen.getByTestId("map")).toHaveAttribute("data-approximate", "false");
    expect(screen.getByText("Exact location provided after booking")).toBeInTheDocument();
  });

  it("a geocoded city shows an approximate-area map", () => {
    render(
      <EventVenueOverview
        location="Cebu City, Cebu"
        mapLat={10.3}
        mapLng={123.9}
        mapApproximate
      />,
    );
    expect(screen.getByTestId("map")).toHaveAttribute("data-approximate", "true");
    expect(screen.getByText(/approximate area/i)).toBeInTheDocument();
  });

  it("public page hides empty description and event info", () => {
    render(<EventVenueOverview />);
    expect(screen.queryByText(/about this experience/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no description added yet/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no details set yet/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Event Info")).not.toBeInTheDocument();
    // The cancellation policy always has a public default.
    expect(screen.getByText(/default policy/i)).toBeInTheDocument();
  });

  it("builder preview keeps the empty description and event info hints", () => {
    render(<EventVenueOverview isPreview />);
    expect(screen.getByText(/no description added yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no details set yet/i)).toBeInTheDocument();
  });

  it("public page shows event info when set", () => {
    render(<EventVenueOverview maxAttendees={80} category="wedding" />);
    expect(screen.getByText("Maximum 80 guests")).toBeInTheDocument();
    expect(screen.getByText("Category: Wedding")).toBeInTheDocument();
  });
});
