import { describe, expect, it } from "vitest";
import {
  BASE_MAX_YEARS_OF_EXPERIENCE,
  CLAIM_MAX_YEARS_OF_EXPERIENCE,
  EXPERIENCE_CLAIM_TOO_LOW,
  EXPERIENCE_CV_REQUIRED,
  bracketLabel,
  exceedsMaxYears,
  experienceBracket,
  experienceClaimError,
  toYearsOfExperience,
  typedBracketLabel,
  wholeYearsMessage,
  yearsMax,
  yearsOfExperienceError,
} from "../yearsOfExperience";

describe("the limits (api#423)", () => {
  it("is 30 years, or 50 when more than 30 is claimed", () => {
    expect(BASE_MAX_YEARS_OF_EXPERIENCE).toBe(30);
    expect(CLAIM_MAX_YEARS_OF_EXPERIENCE).toBe(50);
    expect(yearsMax(false)).toBe(30);
    expect(yearsMax(true)).toBe(50);
    expect(wholeYearsMessage()).toBe("Enter whole years (0–30)");
    expect(wholeYearsMessage(50)).toBe("Enter whole years (0–50)");
  });
});

describe("yearsOfExperienceError", () => {
  it.each(["", "  ", "0", "2", "25", "30", " 7 "])("accepts %j", (raw) => {
    expect(yearsOfExperienceError(raw)).toBeNull();
  });

  it.each([
    "2.5",
    "2.",
    "2,5",
    "31",
    "50",
    "100",
    "-1",
    "abc",
    "1e2",
    "3 years",
  ])("refuses %j up to 30", (raw) => {
    expect(yearsOfExperienceError(raw)).toBe("Enter whole years (0–30)");
  });

  it.each(["31", "42", "50"])("accepts %j up to 50", (raw) => {
    expect(yearsOfExperienceError(raw, 50)).toBeNull();
  });

  it("refuses 51 up to 50", () => {
    expect(yearsOfExperienceError("51", 50)).toBe("Enter whole years (0–50)");
  });
});

describe("exceedsMaxYears", () => {
  it.each(["31", "50", "99", "100", "1000", "007", " 45 "])(
    "refuses the edit %j up to 30",
    (raw) => {
      expect(exceedsMaxYears(raw)).toBe(true);
    },
  );

  // Not over the limit, or not digits: kept as typed and checked (app#327).
  it.each(["", "0", "3", "30", "07", "2.5", "abc", "-1", "1e2"])(
    "keeps the edit %j up to 30",
    (raw) => {
      expect(exceedsMaxYears(raw)).toBe(false);
    },
  );

  it("keeps 42 and refuses 51 up to 50", () => {
    expect(exceedsMaxYears("42", 50)).toBe(false);
    expect(exceedsMaxYears("51", 50)).toBe(true);
  });
});

describe("toYearsOfExperience", () => {
  it("returns whole years as a number", () => {
    expect(toYearsOfExperience("0")).toBe(0);
    expect(toYearsOfExperience("30")).toBe(30);
    expect(toYearsOfExperience("42", 50)).toBe(42);
  });

  it("never turns 2.5 into 25", () => {
    expect(toYearsOfExperience("2.5")).toBeUndefined();
  });

  it("returns undefined for an empty or out-of-range value", () => {
    expect(toYearsOfExperience("")).toBeUndefined();
    expect(toYearsOfExperience("31")).toBeUndefined();
    expect(toYearsOfExperience("51", 50)).toBeUndefined();
  });
});

describe("brackets over 30 years", () => {
  it.each([
    [31, 30],
    [34, 30],
    [35, 35],
    [39, 35],
    [40, 40],
    [44, 40],
    [45, 45],
    [49, 45],
    [50, 50],
  ])("puts %i years in the bracket starting at %i", (years, start) => {
    expect(experienceBracket(years)).toBe(start);
  });

  it("labels each bracket, with 50 on its own", () => {
    expect([30, 35, 40, 45, 50].map(bracketLabel)).toEqual([
      "30+",
      "35+",
      "40+",
      "45+",
      "50",
    ]);
  });

  it("labels what's typed", () => {
    expect(typedBracketLabel("33")).toBe("30+");
    expect(typedBracketLabel("47")).toBe("45+");
    expect(typedBracketLabel("50")).toBe("50");
    expect(typedBracketLabel("30")).toBeNull();
    expect(typedBracketLabel("51")).toBeNull();
    expect(typedBracketLabel("2.5")).toBeNull();
  });
});

describe("experienceClaimError", () => {
  it("has nothing to say when more than 30 isn't claimed", () => {
    expect(experienceClaimError("12", false, false)).toBeNull();
  });

  it.each(["", "30", "2.5"])(
    "asks for more than 30 years when %j is claimed",
    (raw) => {
      expect(experienceClaimError(raw, true, true)).toBe(
        EXPERIENCE_CLAIM_TOO_LOW,
      );
    },
  );

  it("asks for the CV", () => {
    expect(experienceClaimError("42", true, false)).toBe(
      EXPERIENCE_CV_REQUIRED,
    );
  });

  it("is complete with years over 30 and a CV", () => {
    expect(experienceClaimError("42", true, true)).toBeNull();
  });
});
