import { describe, expect, it } from "vitest";

import { venueRateUnit } from "../rateUnit";

describe("venueRateUnit", () => {
  it.each([
    ["hourly", "hr"],
    ["daily", "day"],
    ["nightly", "night"],
    ["weekly", "week"],
    ["monthly", "month"],
  ])("shows %s as %s", (rate, unit) => {
    expect(venueRateUnit(rate)).toBe(unit);
  });

  it("falls back to day when the rate is missing or unknown", () => {
    expect(venueRateUnit(undefined)).toBe("day");
    expect(venueRateUnit(null)).toBe("day");
    expect(venueRateUnit("")).toBe("day");
    expect(venueRateUnit("hour")).toBe("day");
  });
});
