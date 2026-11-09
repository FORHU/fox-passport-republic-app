import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { VenueGalleryGrid } from "../VenueHeader";

vi.mock("@/shared/components/ui/BackButton", () => ({
  BackButton: () => null,
}));

const photos = (n: number) =>
  Array.from({ length: n }, (_, i) => `https://example.com/photo-${i}.jpg`);

const cells = () => screen.getAllByTestId("gallery-cell");

describe("VenueGalleryGrid", () => {
  it("lets a single photo fill the whole grid", () => {
    render(<VenueGalleryGrid images={photos(1)} onOpenGallery={() => {}} />);

    expect(cells()).toHaveLength(1);
    expect(cells()[0].className).toContain("col-span-4 row-span-2");
  });

  it("splits two photos into halves", () => {
    render(<VenueGalleryGrid images={photos(2)} onOpenGallery={() => {}} />);

    for (const cell of cells()) {
      expect(cell.className).toContain("col-span-2 row-span-2");
    }
  });

  it("keeps the five-photo bento layout and shows no more than five", () => {
    render(<VenueGalleryGrid images={photos(7)} onOpenGallery={() => {}} />);

    expect(cells()).toHaveLength(5);
    expect(cells()[0].className).toContain("col-span-2 row-span-2");
    for (const cell of cells().slice(1)) {
      expect(cell.className).not.toContain("col-span");
    }
  });

  it("opens the gallery at the clicked photo", () => {
    const onOpenGallery = vi.fn();
    render(<VenueGalleryGrid images={photos(3)} onOpenGallery={onOpenGallery} />);

    fireEvent.click(cells()[2]);
    expect(onOpenGallery).toHaveBeenCalledWith(2);
  });
});
