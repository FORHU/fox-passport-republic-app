import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("location=Manila"),
}));
vi.mock("@/shared/components/ui/Money", () => ({ Money: () => null }));

import ListingCard from "@/features/landing/components/ListingCard";

describe("ListingCard save button", () => {
  it("has an accessible name and hides its icon", () => {
    render(
      <ListingCard
        venue={{
          id: "v1",
          title: "Sky Lounge",
          category: "Rooftop",
          rating: 4.8,
          price: 1000,
          images: ["/v1.jpg"],
        }}
      />,
    );
    const save = screen.getByRole("button", { name: "Save Sky Lounge" });
    expect(save).toHaveAttribute("type", "button");
    expect(save.querySelector("svg")?.closest("[aria-hidden]")).not.toBeNull();
  });
});
