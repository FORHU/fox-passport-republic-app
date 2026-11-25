import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventHostCard } from "../EventHostCard";

/**
 * app#382: the host card always showed a verified seal and "Identity
 * Verified", even for hosts who never sent an ID. Both now need an approved
 * ID (owner.identityVerifiedAt).
 */

vi.mock("@/features/messages/components/MessageButton", () => ({
  default: () => <button type="button">Contact Event Foxer</button>,
}));

const HOST = { id: "u1", name: "Rae" };

describe("EventHostCard", () => {
  it.each(["full", "compact"] as const)(
    "%s: no Verified mark for a host without an approved ID",
    (variant) => {
      render(
        <EventHostCard
          variant={variant}
          owner={{ ...HOST, identityVerifiedAt: null }}
        />,
      );
      expect(screen.queryByLabelText("ID verified")).toBeNull();
      expect(screen.queryByText(/Identity Verified/)).toBeNull();
    },
  );

  it("full: shows the seal and Identity Verified for an approved ID", () => {
    render(
      <EventHostCard
        owner={{ ...HOST, identityVerifiedAt: "2026-11-20T00:00:00Z" }}
      />,
    );
    expect(screen.getByLabelText("ID verified")).toBeInTheDocument();
    expect(screen.getByText(/Identity Verified/)).toBeInTheDocument();
  });

  it("compact: shows the seal for an approved ID", () => {
    render(
      <EventHostCard
        variant="compact"
        owner={{ ...HOST, identityVerifiedAt: "2026-11-20T00:00:00Z" }}
      />,
    );
    expect(screen.getByLabelText("ID verified")).toBeInTheDocument();
  });
});
