import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skeleton, SkeletonGroup, SkeletonRows } from "../skeleton";
import { Spinner } from "../spinner";

describe("Skeleton", () => {
  it("is hidden from screen readers and stops pulsing under reduced motion", () => {
    const { container } = render(<Skeleton className="h-4 w-10" />);
    const block = container.firstElementChild!;
    expect(block).toHaveAttribute("aria-hidden", "true");
    expect(block.className).toContain("animate-pulse");
    expect(block.className).toContain("motion-reduce:animate-none");
    expect(block.className).toContain("h-4 w-10");
  });

  it("announces the group once as a busy status", () => {
    render(
      <SkeletonGroup label="Loading bookings">
        <Skeleton />
        <Skeleton />
      </SkeletonGroup>,
    );
    const group = screen.getByRole("status", { name: "Loading bookings" });
    expect(group).toHaveAttribute("aria-busy", "true");
  });

  it("draws the requested number of rows, with avatars when asked", () => {
    const { container } = render(
      <SkeletonRows label="Loading people" rows={4} avatar />,
    );
    expect(
      screen.getByRole("status", { name: "Loading people" }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll(".rounded-full")).toHaveLength(4);
  });
});

describe("Spinner", () => {
  it("is hidden from screen readers without a label", () => {
    const { container } = render(<Spinner />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("is a named status with a label", () => {
    render(<Spinner label="Saving" />);
    expect(screen.getByRole("status", { name: "Saving" })).toBeInTheDocument();
  });
});
