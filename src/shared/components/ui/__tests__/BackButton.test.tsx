import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BackButton } from "../BackButton";

const back = vi.fn();
const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back, push }),
}));

describe("BackButton", () => {
  beforeEach(() => {
    back.mockClear();
    push.mockClear();
  });

  it("names the icon-only button for screen readers", () => {
    render(<BackButton />);
    expect(screen.getByRole("button", { name: "Go back" })).toBeInTheDocument();
  });

  it("uses a custom label as the accessible name", () => {
    render(<BackButton label="Back to settings" href="/user/settings" />);
    expect(
      screen.getByRole("link", { name: "Back to settings" }),
    ).toHaveAttribute("href", "/user/settings");
  });

  it("shows the label text in the label variant", () => {
    render(<BackButton variant="label" label="Back to Home" href="/" />);
    expect(
      screen.getByRole("link", { name: "Back to Home" }),
    ).toHaveTextContent("Back to Home");
  });

  it("prefers onClick over href and the fallback", async () => {
    const onClick = vi.fn();
    render(<BackButton href="/x" onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: "Go back" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(push).not.toHaveBeenCalled();
  });

  it("goes to the fallback when there is no same-site history", async () => {
    render(<BackButton fallback="/venues" />);
    await userEvent.click(screen.getByRole("button", { name: "Go back" }));
    expect(push).toHaveBeenCalledWith("/venues");
  });
});
