import { describe, it, expect } from "vitest";
import { packageProposalTarget } from "../packageProposalTarget";

describe("packageProposalTarget", () => {
  it("proposes to the package's venue", () => {
    expect(
      packageProposalTarget({
        templateVenues: [{ venue: { id: "venue-1", name: "The Glasshouse" } }],
      }),
    ).toEqual({ venueId: "venue-1", name: "The Glasshouse" });
  });

  it("skips an entry without a venue", () => {
    expect(
      packageProposalTarget({
        templateVenues: [{ venue: null }, { venue: { id: "venue-2" } }],
      }),
    ).toEqual({ venueId: "venue-2", name: "This venue" });
  });

  it("has no target for a package without a venue", () => {
    expect(packageProposalTarget({ templateVenues: [] })).toBeNull();
    expect(packageProposalTarget(undefined)).toBeNull();
  });
});
