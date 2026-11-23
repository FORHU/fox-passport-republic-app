import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RevenueProjector } from "@/features/venue/components/venue-builder/RevenueProjector";
import { useVenueBuilderStore } from "@/features/venue/store/useVenueBuilderStore";

describe("RevenueProjector & baseRate placeholder (api#430, app#395)", () => {
  it("initializes baseRate to 0 so Nightly Rate starts empty with a placeholder instead of a pre-filled amount", () => {
    useVenueBuilderStore.getState().reset();
    expect(useVenueBuilderStore.getState().baseRate).toBe(0);
  });

  it("renders left-aligned Nightly Rate and Extra Guest Rate inputs with placeholders", () => {
    render(
      <RevenueProjector
        baseRate={0}
        occupancyRate={60}
        extraGuestRate={0}
        capacity="100"
        monthlyBase={0}
        monthlyAddons={0}
        total={0}
        onBaseRateChange={vi.fn()}
        onOccupancyRateChange={vi.fn()}
        onExtraGuestRateChange={vi.fn()}
        onPreview={vi.fn()}
      />,
    );

    const nightlyInput = screen.getByPlaceholderText(
      "e.g. 15000",
    ) as HTMLInputElement;
    const extraGuestInput = screen.getByPlaceholderText(
      "Leave blank to disallow",
    ) as HTMLInputElement;

    expect(nightlyInput.value).toBe("");
    expect(nightlyInput.className).toContain("text-left");
    expect(nightlyInput.className).not.toContain("text-right");

    expect(extraGuestInput.value).toBe("");
    expect(extraGuestInput.className).toContain("text-left");
    expect(extraGuestInput.className).not.toContain("text-right");
  });
});
