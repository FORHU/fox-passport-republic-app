import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  SERVICE_CATEGORIES,
  SERVICE_STATUSES,
} from "@/shared/data/listingBuilderData";

// The location and policy pickers fetch; they aren't what's under test.
vi.mock("@/shared/components/ui/CascadingLocationFields", () => ({
  CascadingLocationFields: () => null,
}));
vi.mock("@/shared/components/ui/CancellationPolicyPicker", () => ({
  default: () => null,
}));

import { ListingSidebar } from "../ListingSidebar";

function renderSidebar() {
  const noop = vi.fn();
  return render(
    <ListingSidebar
      activeType="service"
      categories={SERVICE_CATEGORIES}
      currentStatuses={SERVICE_STATUSES}
      category="design"
      customCategory=""
      condition=""
      price={100}
      unit="Per Hour"
      status="active"
      cancellationPolicyId={null}
      onCategorySelect={noop}
      onCustomCategoryChange={noop}
      onConditionChange={noop}
      onPriceChange={noop}
      onUnitChange={noop}
      onStatusChange={noop}
      onCancellationPolicyChange={noop}
    />,
  );
}

describe("ListingSidebar Initial Status", () => {
  // The radios are sr-only (position: absolute). Unless their label is
  // positioned, they sit against the aside, outside the scrolling field list:
  // the studio row overflows, and focusing one scrolls that overflow-hidden
  // row so its top can't be scrolled back (#406).
  it("keeps each sr-only radio inside a positioned label", () => {
    renderSidebar();

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(SERVICE_STATUSES.length);
    for (const radio of radios) {
      expect(radio).toHaveClass("sr-only");
      expect(radio.closest("label")).toHaveClass("relative");
    }
  });
});
