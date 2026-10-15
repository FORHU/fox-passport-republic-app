import { describe, expect, it } from "vitest";
import { createBuildingClusterPinElement } from "@/shared/components/ui/VenuesMap";

describe("createBuildingClusterPinElement", () => {
  it("does not animate the transform Mapbox uses to position the marker", () => {
    const marker = createBuildingClusterPinElement(7);

    expect(marker.style.transition).not.toMatch(/transform/);
  });
});
