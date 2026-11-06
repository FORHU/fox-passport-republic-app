import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { EventGallery } from "@/app/event/[eventId]/_components/EventGallery";

describe("EventGallery alt text", () => {
  it("names the event and numbers each image", () => {
    render(
      <EventGallery
        eventName="Beach Wedding Cebu"
        images={["/a.jpg", "/b.jpg", "/c.jpg"]}
      />,
    );
    const alts = screen.getAllByRole("img").map((i) => i.getAttribute("alt"));
    expect(alts).toEqual([
      "Beach Wedding Cebu (1 of 3)",
      "Beach Wedding Cebu (2 of 3)",
      "Beach Wedding Cebu (3 of 3)",
    ]);
  });

  it("uses the bare event name for a single image", () => {
    render(<EventGallery eventName="Rooftop Party" images={["/a.jpg"]} />);
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Rooftop Party");
  });

  it("describes the image open in the lightbox", () => {
    render(
      <EventGallery eventName="Rooftop Party" images={["/a.jpg", "/b.jpg"]} />,
    );
    fireEvent.click(screen.getByAltText("Rooftop Party (2 of 2)"));
    expect(screen.getAllByAltText("Rooftop Party (2 of 2)")).toHaveLength(2);
  });
});
