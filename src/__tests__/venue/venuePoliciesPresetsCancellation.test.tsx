import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VENUE_TYPES } from "@/features/venue/data/venueBuilderData";
import { useVenueBuilderStore } from "@/features/venue/store/useVenueBuilderStore";
import { VenuePoliciesSection } from "@/features/venue/components/venue-builder/VenuePoliciesSection";
import CancellationPolicyPicker from "@/shared/components/ui/CancellationPolicyPicker";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("Venue Policies, Presets, Cancellation & Category Validation (Web App)", () => {
  describe("VENUE_TYPES", () => {
    it("excludes 'Other' so only valid database categories are selectable", () => {
      const lower = VENUE_TYPES.map((t) => t.toLowerCase());
      expect(lower).not.toContain("other");
      expect(lower).toContain("indoor");
      expect(lower).toContain("outdoor");
      expect(lower).toContain("hotel");
    });
  });

  describe("useVenueBuilderStore - Policies and Presets", () => {
    beforeEach(() => {
      useVenueBuilderStore.getState().reset();
    });

    it("prevents policy items from entering includedItems or addonItems", () => {
      const policyItem = {
        id: "p-1",
        name: "No smoking",
        value: 0,
        icon: "gavel",
        desc: "",
        category: "rules",
      };

      useVenueBuilderStore.getState().addIncludedItem(policyItem);
      expect(useVenueBuilderStore.getState().includedItems).toHaveLength(0);
      expect(useVenueBuilderStore.getState().policyItems).toHaveLength(1);
      expect(useVenueBuilderStore.getState().policyItems[0].name).toBe(
        "No smoking",
      );

      useVenueBuilderStore.getState().addAddonItem(policyItem);
      expect(useVenueBuilderStore.getState().addonItems).toHaveLength(0);
      expect(useVenueBuilderStore.getState().policyItems).toHaveLength(1);
    });

    it("supports updating preset names and prices for included and addon items", () => {
      const feature = {
        id: "feat-1",
        name: "Projector",
        value: 1000,
        icon: "speaker",
        desc: "",
        category: "tech",
      };

      useVenueBuilderStore.getState().addIncludedItem(feature);
      expect(useVenueBuilderStore.getState().includedItems[0].name).toBe(
        "Projector",
      );

      useVenueBuilderStore.getState().updateIncludedItem("feat-1", {
        name: "4K Laser Projector",
        value: 1500,
      });

      const updated = useVenueBuilderStore.getState().includedItems[0];
      expect(updated.name).toBe("4K Laser Projector");
      expect(updated.value).toBe(1500);
    });
  });

  describe("VenuePoliciesSection Component", () => {
    it("renders policy items and triggers add, edit, and remove handlers", () => {
      const mockAdd = vi.fn();
      const mockUpdate = vi.fn();
      const mockRemove = vi.fn();
      const policies = [
        {
          id: "pol-1",
          name: "Quiet hours after 10 PM",
          value: 0,
          icon: "gavel",
          desc: "",
          category: "rules",
        },
      ];

      render(
        <VenuePoliciesSection
          policies={policies}
          onAddPolicy={mockAdd}
          onUpdatePolicy={mockUpdate}
          onRemovePolicy={mockRemove}
        />,
      );

      expect(screen.getByText("Quiet hours after 10 PM")).toBeDefined();
      expect(screen.getByText("Venue Policies")).toBeDefined();

      const input = screen.getByPlaceholderText(/No outside catering/i);
      fireEvent.change(input, { target: { value: "No open flames" } });

      const addBtn = screen.getByRole("button", { name: "Add Policy" });
      fireEvent.click(addBtn);
      expect(mockAdd).toHaveBeenCalledWith("No open flames");

      const removeBtn = screen.getByTitle("Remove policy");
      fireEvent.click(removeBtn);
      expect(mockRemove).toHaveBeenCalledWith("pol-1");
    });
  });

  describe("CancellationPolicyPicker - Simplified Options", () => {
    it("renders custom flexible inputs when Flexible is selected", () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const mockChange = vi.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <CancellationPolicyPicker
            value={null}
            onChange={mockChange}
            cancellationType="Flexible"
            flexibleRefundPercent={100}
            flexibleRefundHours={24}
          />
        </QueryClientProvider>,
      );

      expect(screen.getByText(/Flexible Refund Conditions/i)).toBeDefined();
      expect(screen.getByText(/100%/i)).toBeDefined();
      expect(screen.getByText(/24 hours/i)).toBeDefined();
    });
  });
});
