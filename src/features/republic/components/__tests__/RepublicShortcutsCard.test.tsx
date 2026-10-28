import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { RepublicShortcutsCard } from "../RepublicShortcutsCard";

/** The sidebar linked every visitor to the Venue Studio and the hub builder. */

const signInWith = (permissions: string[]) =>
  useAuthStore.setState({ user: { permissions } as never });

beforeEach(() => useAuthStore.setState({ user: null }));

describe("RepublicShortcutsCard", () => {
  it("hides the builders from someone without the roles", () => {
    signInWith(["payouts:onboard"]);
    render(<RepublicShortcutsCard />);
    expect(screen.queryByText(/Draw & Add Venue/)).toBeNull();
    expect(screen.queryByText(/Register Equipment Hub/)).toBeNull();
    expect(screen.getByText("Saved Posts")).toBeTruthy();
  });

  it("shows each builder to whoever can open it", () => {
    signInWith(["venue:manage", "partnership:propose"]);
    render(<RepublicShortcutsCard />);
    expect(screen.getByText(/Draw & Add Venue/)).toBeTruthy();
    expect(screen.getByText(/Register Equipment Hub/)).toBeTruthy();
  });
});
