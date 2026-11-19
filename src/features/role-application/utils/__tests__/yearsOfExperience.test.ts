import { describe, expect, it } from "vitest";
import {
  WHOLE_YEARS_MESSAGE,
  toYearsOfExperience,
  yearsOfExperienceError,
} from "../yearsOfExperience";

describe("yearsOfExperienceError", () => {
  it.each(["", "  ", "0", "2", "25", "100", " 7 "])("accepts %j", (raw) => {
    expect(yearsOfExperienceError(raw)).toBeNull();
  });

  it.each(["2.5", "2.", "2,5", "101", "1000", "-1", "abc", "1e2", "3 years"])(
    "refuses %j",
    (raw) => {
      expect(yearsOfExperienceError(raw)).toBe(WHOLE_YEARS_MESSAGE);
    },
  );
});

describe("toYearsOfExperience", () => {
  it("returns whole years as a number", () => {
    expect(toYearsOfExperience("0")).toBe(0);
    expect(toYearsOfExperience("25")).toBe(25);
    expect(toYearsOfExperience("100")).toBe(100);
  });

  it("never turns 2.5 into 25", () => {
    expect(toYearsOfExperience("2.5")).toBeUndefined();
  });

  it("returns undefined for an empty or out-of-range value", () => {
    expect(toYearsOfExperience("")).toBeUndefined();
    expect(toYearsOfExperience("101")).toBeUndefined();
  });
});
