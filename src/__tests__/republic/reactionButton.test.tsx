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

  it("renders reacted state with active tinted background, border, ring, and aria-pressed=true", () => {
    render(
      <ReactionButton myReaction="like" likesCount={4} onReact={vi.fn()} />,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAttribute("data-reacted", "true");
    expect(button.className).toContain("bg-accent/15");
    expect(button.className).toContain("border-accent/45");
    expect(button.className).toContain("font-bold");
  });
});
