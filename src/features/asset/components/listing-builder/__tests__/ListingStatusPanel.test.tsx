/** #405: the Preview Page button works without a saved listing. */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ListingStatusPanel } from "../ListingStatusPanel";

vi.mock("@/shared/components/ui/Money", () => ({
  Money: ({ amount }: { amount: number }) => <>{amount}</>,
}));

const base = {
  activeType: "service" as const,
  categories: [],
  category: "",
  customCategory: "",
  condition: "",
  price: 100,
  unit: "Per Hour",
  completionPercentage: 30,
  isReadyToPublish: false,
};

describe("ListingStatusPanel Preview Page", () => {
  it("is disabled with neither onPreview nor previewHref", () => {
    render(<ListingStatusPanel {...base} />);
    expect(screen.getByRole("button", { name: "Preview Page" })).toBeDisabled();
  });

  it("calls onPreview before anything is saved", () => {
    const onPreview = vi.fn();
    render(<ListingStatusPanel {...base} onPreview={onPreview} />);
    const button = screen.getByRole("button", { name: "Preview Page" });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(onPreview).toHaveBeenCalledTimes(1);
  });

  it("still opens previewHref in a new tab", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<ListingStatusPanel {...base} previewHref="/booking/asset/a1" />);
    fireEvent.click(screen.getByRole("button", { name: "Preview Page" }));
    expect(open).toHaveBeenCalledWith("/booking/asset/a1", "_blank");
    open.mockRestore();
  });
});
