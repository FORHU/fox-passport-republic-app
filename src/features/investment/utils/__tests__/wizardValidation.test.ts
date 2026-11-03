import { describe, it, expect } from "vitest";
import {
  apiFieldErrors,
  firstInvalidStep,
  stepErrors,
} from "../wizardValidation";

const complete = {
  title: "500 Chiavari Chairs",
  description: "White padded chairs, stackable, 45cm seat height.",
  inventoryCategory: "furniture_seating",
  quantityTotal: 500,
  monetaryValue: 0,
  revenueSharePercent: 10,
  targetVenue: null,
  location: { lat: 14.6, lng: 121, deliveryRadiusKm: 25 },
};

describe("stepErrors", () => {
  it("passes complete Equipment Details", () => {
    expect(stepErrors(complete, "physical_inventory", 2)).toEqual({});
  });

  it("flags every Equipment Details problem at once, matching the API's rules", () => {
    const errors = stepErrors(
      {
        ...complete,
        title: "  ab ",
        description: "short",
        inventoryCategory: null,
        quantityTotal: 100_001,
      },
      "physical_inventory",
      2,
    );
    expect(Object.keys(errors)).toEqual([
      "title",
      "inventoryCategory",
      "quantityTotal",
      "description",
    ]);
  });

  it("caps the title at 120 and the description at 2,000 characters", () => {
    const errors = stepErrors(
      { ...complete, title: "x".repeat(121), description: "x".repeat(2001) },
      "physical_inventory",
      2,
    );
    expect(errors.title).toBe("Titles can be up to 120 characters.");
    expect(errors.description).toBe("Descriptions can be up to 2,000 characters.");
  });

  it("checks venue equity's own fields, not the equipment ones", () => {
    const errors = stepErrors(
      { ...complete, inventoryCategory: null, revenueSharePercent: 0 },
      "venue_equity",
      2,
    );
    expect(Object.keys(errors)).toEqual(["revenueSharePercent"]);
    expect(stepErrors(complete, "venue_equity", 3)).toHaveProperty("targetVenue");
  });
});

describe("firstInvalidStep", () => {
  it("stops at the first incomplete step before the one asked for", () => {
    expect(firstInvalidStep({ ...complete, title: "" }, "physical_inventory", 4)).toBe(2);
    expect(firstInvalidStep(complete, "physical_inventory", 4)).toBe(4);
    expect(firstInvalidStep({ ...complete, title: "" }, "physical_inventory", 1)).toBe(1);
  });
});

describe("apiFieldErrors", () => {
  const rejected = (fields: unknown, status = 400) => ({
    response: { status, data: { fields } },
  });

  it("keys the API's fields by wizard field", () => {
    expect(
      apiFieldErrors(
        rejected([
          { field: "quantityTotal", message: "Enter how many units are available." },
          { field: "lat", message: "Lat is required." },
          { field: "broadcastToFeed", message: "ignored" },
        ]),
      ),
    ).toEqual({
      quantityTotal: "Enter how many units are available.",
      location: "Lat is required.",
    });
  });

  it("ignores anything but a 400 with a fields list", () => {
    expect(apiFieldErrors(rejected([{ field: "title", message: "x" }], 500))).toEqual({});
    expect(apiFieldErrors(rejected("nope"))).toEqual({});
    expect(apiFieldErrors(new Error("offline"))).toEqual({});
  });
});
