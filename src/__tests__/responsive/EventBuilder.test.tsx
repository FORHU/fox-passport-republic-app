import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ResourcePalette } from "@/features/event/components/event-builder/ResourcePalette";
import { EventBlueprint } from "@/features/event/components/event-builder/EventBlueprint";

vi.mock("next/image", () => ({
  default: (props: any) => <img src="mock.png" alt={props.alt ?? ""} {...props} />,
}));

const paletteProps = {
  activeCategory: "all",
  searchQuery: "",
  filteredResources: [],
  onCategoryChange: vi.fn(),
  onSearchChange: vi.fn(),
  onDragStart: vi.fn(),
};

const blueprintProps = {
  targetMargin: 20,
  baseCost: 1000,
  suggestedPrice: 1500,
  venueCost: 500,
  talentCost: 500,
  blueprintHealth: 80,
  onMarginChange: vi.fn(),
};

describe("Event builder sidebars — responsive", () => {
  it("ResourcePalette is docked (hidden below md) by default", () => {
    const { container } = render(<ResourcePalette {...paletteProps} />);
    const dockedNav = container.querySelector("nav.hidden.md\\:flex");
    const dockedAside = container.querySelector("aside.hidden.md\\:flex");
    expect(dockedNav).not.toBeNull();
    expect(dockedAside).not.toBeNull();
  });

  it("ResourcePalette with inDrawer renders always-visible (no `hidden`)", () => {
    const { container } = render(<ResourcePalette {...paletteProps} inDrawer />);
    const hiddenEls = container.querySelectorAll(".hidden");
    expect(hiddenEls.length).toBe(0);
    // The list aside becomes `flex w-full`.
    const listAside = container.querySelector("aside.flex.w-full");
    expect(listAside).not.toBeNull();
  });

  it("EventBlueprint is docked (hidden below md) by default", () => {
    const { container } = render(<EventBlueprint {...blueprintProps} />);
    const docked = container.querySelector("aside.hidden.md\\:flex");
    expect(docked).not.toBeNull();
  });

  it("EventBlueprint with inDrawer renders always-visible (no `hidden`)", () => {
    const { container } = render(<EventBlueprint {...blueprintProps} inDrawer />);
    const hiddenEls = container.querySelectorAll(".hidden");
    expect(hiddenEls.length).toBe(0);
    const visible = container.querySelector("aside.flex.w-full");
    expect(visible).not.toBeNull();
  });
});
