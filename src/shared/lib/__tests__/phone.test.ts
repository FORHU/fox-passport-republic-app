import { describe, it, expect } from "vitest";
import {
  countryOfPhone,
  formatPhone,
  normalizeContactPhone,
  phoneExample,
  phoneSchema,
  rehomePhone,
  splitPhone,
  toE164,
} from "../phone";

// Mirrors the API's PUT /profile cases (tests/profile.update.spec.ts).
const PROJECT = new Set(["PH", "US", "GB", "DO"]);
const ph = phoneSchema("PH", PROJECT);

describe("phoneSchema", () => {
  it("allows an empty phone so it can be cleared", () => {
    expect(ph.parse("")).toBe("");
    expect(ph.parse("   ")).toBe("");
  });

  it.each([
    ["+63 917 123 4567", "+639171234567"],
    ["0917-123-4567", "+639171234567"],
    ["917 123 4567", "+639171234567"],
    ["(02) 8123 4567", "+63281234567"],
    ["+44 20 7946 0958", "+442079460958"],
  ])("stores %j as %j", (input, output) => {
    expect(ph.parse(input)).toBe(output);
  });

  it("reads a number without a +code in the selected country", () => {
    expect(phoneSchema("US", PROJECT).parse("415 555 0132")).toBe(
      "+14155550132",
    );
  });

  it.each([
    "12345",
    "12345678",
    "0917abc4567",
    "<b>09171234567</b>",
    "+00000000",
    "+63 000 000 0000",
    "1234567890123456",
    "+",
  ])("rejects %j", (value) => {
    expect(ph.safeParse(value).success).toBe(false);
  });

  it("rejects a valid number from a country not in the list", () => {
    expect(ph.safeParse("+81 3 1234 5678").success).toBe(false);
  });
});

describe("splitPhone", () => {
  it("splits a saved number into its country and grouped digits", () => {
    expect(splitPhone("+639171234567")).toEqual({
      country: "PH",
      number: "917 123 4567",
    });
    expect(splitPhone("+14155550132")).toEqual({
      country: "US",
      number: "415 555 0132",
    });
  });

  it("reads a number saved before E.164 as Philippine", () => {
    expect(splitPhone("09171234567")).toEqual({
      country: "PH",
      number: "917 123 4567",
    });
  });

  it("leaves an empty phone empty", () => {
    expect(splitPhone("")).toEqual({ number: "" });
  });
});

describe("countryOfPhone", () => {
  it("names the country only when the number carries its own +code", () => {
    expect(countryOfPhone("+44 20 7946 0958")).toBe("GB");
    expect(countryOfPhone("0917 123 4567")).toBeUndefined();
  });
});

// The phone inputs (react-phone-number-input) show numbers for the picked
// country; these feed them.
describe("phoneExample", () => {
  it("gives the country's example mobile number without its +code", () => {
    expect(phoneExample("PH")).toMatch(/^9\d\d \d{3} \d{4}$/);
    expect(phoneExample("US")).toMatch(/^\d{3} \d{3} \d{4}$/);
    expect(phoneExample("GB")).toMatch(/^7\d{3} \d{6}$/);
  });

  it("gives nothing for a country with no numbering", () => {
    expect(phoneExample("AQ")).toBe("");
    expect(phoneExample("")).toBe("");
  });
});

describe("toE164", () => {
  it("keeps E.164 and reads a pre-E.164 number as Philippine", () => {
    expect(toE164("+14155550132")).toBe("+14155550132");
    expect(toE164("09171234567")).toBe("+639171234567");
    expect(toE164("")).toBe("");
    expect(toE164("not a number")).toBe("");
  });
});

describe("rehomePhone", () => {
  it("keeps the typed digits under the new country code", () => {
    expect(rehomePhone("+639171234567", "PH", "US")).toBe("+19171234567");
    // Half a number too.
    expect(rehomePhone("+63917", "PH", "GB")).toBe("+44917");
    expect(rehomePhone("", "PH", "US")).toBe("");
  });
});

describe("formatPhone", () => {
  it("shows E.164 in international format", () => {
    expect(formatPhone("+639171234567")).toBe("+63 917 123 4567");
    expect(formatPhone("")).toBe("");
  });
});

describe("normalizeContactPhone", () => {
  it("accepts a Philippine mobile number", () => {
    expect(normalizeContactPhone("0917 123 4567", "PH")).toBe("+639171234567");
    expect(normalizeContactPhone("+6309171234567", "PH")).toBe("+639171234567");
  });

  it("refuses a Philippine landline", () => {
    expect(normalizeContactPhone("+63 2 8123 4567", "PH")).toBeNull();
    expect(normalizeContactPhone("(02) 8123 4567", "PH")).toBeNull();
  });

  it("keeps landlines outside the Philippines", () => {
    expect(normalizeContactPhone("202 555 0123", "US")).toBe("+12025550123");
  });
});
