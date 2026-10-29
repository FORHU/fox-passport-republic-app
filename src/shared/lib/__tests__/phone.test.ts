import { describe, it, expect } from "vitest";
import { countryOfPhone, phoneSchema, splitPhone } from "../phone";

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
