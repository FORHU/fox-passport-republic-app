import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateInvestmentWizard from "../CreateInvestmentWizard";
import { toast } from "sonner";
import { createInvestment, updateInvestment } from "@/shared/api/investments";

// Mock Next.js router — one stable instance, like the real hook returns.
const mockPush = vi.fn();
const mockBack = vi.fn();
const mockRouter = { push: mockPush, back: mockBack };
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

// Mock Sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock API and Venues
vi.mock("@/shared/api/investments", () => ({
  createInvestment: vi.fn().mockResolvedValue({ id: "inv-123" }),
  fetchInvestmentById: vi.fn().mockResolvedValue({
    id: "inv-9",
    title: "Banquet Chairs",
    description: "Two hundred padded banquet chairs, stackable.",
    inventoryCategory: "furniture_seating",
    quantityTotal: 200,
    lat: 10.3,
    lng: 123.9,
    city: "Cebu",
    country: "Philippines",
    mediaUrls: [],
  }),
  updateInvestment: vi.fn().mockResolvedValue({ id: "inv-9" }),
}));

vi.mock("@/shared/api/venues", () => ({
  searchVenues: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/shared/lib/axios", () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { data: { url: "https://example.com/photo.jpg" } } }),
  },
}));

// Mock InvestmentLocationPicker to keep tests isolated
vi.mock("../InvestmentLocationPicker", () => ({
  default: () => <div data-testid="mock-location-picker">Location Picker</div>,
}));

describe("CreateInvestmentWizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("renders Step 1 with both modality options by default", () => {
    render(<CreateInvestmentWizard />);

    expect(screen.getByText("Choose Investment Stream")).toBeInTheDocument();
    expect(screen.getByText("Physical Equipment & Inventory Hub")).toBeInTheDocument();
    expect(screen.getByText("Financial Capital & Venue Equity")).toBeInTheDocument();
  });

  it("advances from Step 1 to Step 2 upon clicking Continue", () => {
    render(<CreateInvestmentWizard />);

    const continueBtn = screen.getByRole("button", {
      name: /continue to equipment details/i,
    });
    fireEvent.click(continueBtn);

    expect(screen.getByText("Equipment / Tool Name *")).toBeInTheDocument();
    expect(screen.getByText("Quantity Available in Depot *")).toBeInTheDocument();
  });

  it("prevents advancing from Step 2 to Step 3 if title and description are missing", () => {
    render(<CreateInvestmentWizard />);

    // Advance to Step 2
    fireEvent.click(screen.getByRole("button", { name: /continue to equipment details/i }));

    // Try to advance without filling title/description
    const step3Btn = screen.getByRole("button", { name: /set location on map/i });
    fireEvent.click(step3Btn);

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Please provide an equipment name"),
    );
    // Should still be on Step 2
    expect(screen.getByText("Equipment / Tool Name *")).toBeInTheDocument();
  });

  it("advances to Step 3 and renders location picker when step 2 fields are valid", async () => {
    render(<CreateInvestmentWizard />);

    // Go to Step 2
    fireEvent.click(screen.getByRole("button", { name: /continue to equipment details/i }));

    // Fill valid data
    const titleInput = screen.getByPlaceholderText(/e\.g\. 500 white padded/i);
    fireEvent.change(titleInput, { target: { value: "Pro Sound PA Speakers" } });

    const descInput = screen.getByPlaceholderText(/include dimensions/i);
    fireEvent.change(descInput, {
      target: { value: "Set of 4 high-output active PA speakers with stands and cables." },
    });

    // Advance to Step 3
    const step3Btn = screen.getByRole("button", { name: /set location on map/i });
    fireEvent.click(step3Btn);

    await waitFor(() => {
      expect(screen.getByText("Depot / Warehouse Location")).toBeInTheDocument();
      expect(screen.getByTestId("mock-location-picker")).toBeInTheDocument();
    });
  });

  it("persists draft in sessionStorage on form changes", async () => {
    render(<CreateInvestmentWizard />);

    // Go to Step 2
    fireEvent.click(screen.getByRole("button", { name: /continue to equipment details/i }));

    const titleInput = screen.getByPlaceholderText(/e\.g\. 500 white padded/i);
    fireEvent.change(titleInput, { target: { value: "Generators & Lights" } });

    await waitFor(() => {
      const storedRaw = sessionStorage.getItem("foxpassport_draft_investment_wizard");
      expect(storedRaw).toBeTruthy();
      const parsed = JSON.parse(storedRaw!);
      expect(parsed.form.title).toBe("Generators & Lights");
    });
  });

  it("edit mode prefills the hub, skips drafting, and saves with a PATCH", async () => {
    render(<CreateInvestmentWizard editId="inv-9" />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Banquet Chairs")).toBeInTheDocument();
    });
    expect(screen.getByText("Edit Equipment Hub")).toBeInTheDocument();
    expect(sessionStorage.getItem("foxpassport_draft_investment_wizard")).toBeNull();

    fireEvent.change(screen.getByDisplayValue("Banquet Chairs"), {
      target: { value: "Banquet Chairs (Gold)" },
    });
    fireEvent.click(screen.getByRole("button", { name: /photos & deploy/i }));
    fireEvent.click(await screen.findByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateInvestment).toHaveBeenCalledWith(
        "inv-9",
        expect.objectContaining({ title: "Banquet Chairs (Gold)", city: "Cebu" }),
      );
      expect(mockPush).toHaveBeenCalledWith("/republic/investments");
    });
    expect(createInvestment).not.toHaveBeenCalled();
  });
});
