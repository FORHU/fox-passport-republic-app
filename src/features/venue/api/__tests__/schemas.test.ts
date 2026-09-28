import { describe, expect, it } from "vitest";
import { parseVenueListResponse } from "../schemas";

describe("venue API response contracts", () => {
  const venue = { id: "venue-1", name: "Test Venue", capacity: 80 };

  it.each([
    ["array", [venue]],
    ["venues", { venues: [venue] }],
    ["data", { data: [venue] }],
  ])("accepts the %s list shape", (_label, payload) => {
    expect(parseVenueListResponse(payload)).toEqual([venue]);
  });

  it("rejects a malformed envelope instead of silently returning an empty list", () => {
    expect(() => parseVenueListResponse({ result: [venue] })).toThrow();
  });

  it("rejects a venue without its identity fields", () => {
    expect(() => parseVenueListResponse({ venues: [{ capacity: 80 }] })).toThrow();
  });
});
