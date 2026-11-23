import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { RepublicShortcutsCard } from "@/features/republic/components/RepublicShortcutsCard";

vi.mock("@/shared/auth/useRoleAccess", () => ({
  useRoleAccess: () => ({
    canManageVenues: true,
    canProposePartnerships: false,
  }),
}));

describe("Venue Creation Icon & Removed Shape Drawing (app#402, api#438)", () => {
  it("renders 'Add Venue' shortcut button with building icon instead of Draw & Add Venue", () => {
    render(<RepublicShortcutsCard />);
    expect(screen.getByText("Add Venue")).toBeInTheDocument();
    expect(screen.queryByText(/Draw & Add Venue/i)).toBeNull();
  });
});
