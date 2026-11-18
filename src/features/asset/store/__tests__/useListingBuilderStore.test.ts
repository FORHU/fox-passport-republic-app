import { describe, it, expect, beforeEach } from "vitest";
import { useListingBuilderStore } from "../useListingBuilderStore";

// A new listing starts on one of its Initial Status options, so the Studio
// opens with one checked and Publish saves it (app#323: a "draft" default
// was published as a draft). Save Draft sends "draft" itself, and the edit
// pages set "draft" for a listing still on its way to review.

describe("useListingBuilderStore — initial status", () => {
  beforeEach(() => {
    useListingBuilderStore.getState().reset();
  });

  it("initializes inventory listing with status available", () => {
    useListingBuilderStore.getState().initializeForType("inventory");
    expect(useListingBuilderStore.getState().status).toBe("available");
  });

  it("initializes service listing with status active", () => {
    useListingBuilderStore.getState().initializeForType("service");
    expect(useListingBuilderStore.getState().status).toBe("active");
  });

  it("resets to available status", () => {
    useListingBuilderStore.getState().setStatus("reserved");
    useListingBuilderStore.getState().reset();
    expect(useListingBuilderStore.getState().status).toBe("available");
  });
});
