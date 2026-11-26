import { describe, expect, it } from "vitest";
import { experienceLine } from "../experienceLine";

/**
 * api#423: once approved, an applicant sees their years of experience on
 * /kyc, as the admin left it.
 */
describe("experienceLine", () => {
  it("shows a confirmed claim as its bracket", () => {
    expect(
      experienceLine({
        status: "approved",
        eventFoxerApplication: { experience: "40", claimedExperience: 40 },
      }),
    ).toBe("40+ years of experience");
  });

  it("shows 50 without a plus", () => {
    expect(
      experienceLine({
        status: "approved",
        organizerApplication: { experience: 50, claimedExperience: 50 },
      }),
    ).toBe("50 years of experience");
  });

  it("shows a claim lowered to 30 as 30", () => {
    expect(
      experienceLine({
        status: "approved",
        providerFoxerApplication: { experience: 30, claimedExperience: 40 },
      }),
    ).toBe("30 years of experience");
  });

  it("shows plain years, and 1 year in the singular", () => {
    expect(
      experienceLine({
        status: "approved",
        providerFoxerApplication: { experience: 12, claimedExperience: null },
      }),
    ).toBe("12 years of experience");
    expect(
      experienceLine({
        status: "approved",
        eventFoxerApplication: { experience: "1" },
      }),
    ).toBe("1 year of experience");
  });

  it.each(["pending", "revision_requested", "rejected"])(
    "shows nothing while %s",
    (status) => {
      expect(
        experienceLine({
          status,
          organizerApplication: { experience: 45, claimedExperience: 45 },
        }),
      ).toBeNull();
    },
  );

  it("shows nothing when no experience was given", () => {
    expect(
      experienceLine({
        status: "approved",
        providerFoxerApplication: { experience: null },
      }),
    ).toBeNull();
    expect(experienceLine({ status: "approved" })).toBeNull();
  });
});
