import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { FeedSortMenu } from "../FeedSortMenu";

/** app#308: the sort menu offers For You and Recent; Top is gone. */
describe("FeedSortMenu", () => {
  it("offers For You and Recent, and nothing else", () => {
    render(<FeedSortMenu mode="foryou" onChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /for you/i }));
    expect(screen.getAllByText("For You").length).toBeGreaterThan(0);
    expect(screen.getByText("Recent")).toBeInTheDocument();
    expect(screen.queryByText("Top Posts")).not.toBeInTheDocument();
  });

  it("switches to Recent", () => {
    const onChange = vi.fn();
    render(<FeedSortMenu mode="foryou" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /for you/i }));
    fireEvent.click(screen.getByText("Recent"));
    expect(onChange).toHaveBeenCalledWith("recent");
  });
});
