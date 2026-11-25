import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReactionButton } from "@/features/republic/components/ReactionButton";

describe("ReactionButton visual distinction (app#392)", () => {
  it("renders un-reacted state as muted and borderless with aria-pressed=false", () => {
    render(
      <ReactionButton myReaction={null} likesCount={6} onReact={vi.fn()} />,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveAttribute("data-reacted", "false");
    expect(button.className).toContain("border-transparent");
    expect(button.className).toContain("text-zinc-400");
  });

  it("shows only the chosen emoji when reacted, with no tinted container (api#427)", () => {
    const { rerender } = render(
      <ReactionButton myReaction={null} likesCount={4} onReact={vi.fn()} />,
    );
    const before = screen.getByRole("button").className;

    rerender(
      <ReactionButton myReaction="haha" likesCount={4} onReact={vi.fn()} />,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAttribute("data-reacted", "true");
    // The button keeps the same look; only the emoji swaps.
    expect(button.className).toBe(before);
    expect(button.className).not.toMatch(/bg-\w+-500\/15|bg-accent\/15|ring-1/);
    expect(button).toHaveTextContent("😂");
    expect(button).not.toHaveTextContent("👍");
  });

  it("shows the greyed default emoji until a reaction is picked", () => {
    render(
      <ReactionButton myReaction={null} likesCount={0} onReact={vi.fn()} />,
    );
    expect(screen.getByText("👍")).toHaveClass("grayscale");
  });
});
