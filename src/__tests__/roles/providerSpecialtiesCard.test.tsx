import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }));
vi.mock("@/shared/lib/axios", () => ({ default: api }));

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

vi.mock("@/shared/api/providerSpecialties", () => ({
  useProviderSpecialties: () => ({
    data: [
      { slug: "dj", name: "DJ" },
      { slug: "photography", name: "Photography" },
      { slug: "videography", name: "Videography" },
    ],
    isLoading: false,
  }),
}));

import { ProviderSpecialtiesCard } from "@/features/user/components/ProviderSpecialtiesCard";

const renderCard = (current = [{ slug: "dj", name: "DJ" }]) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ProviderSpecialtiesCard current={current} />
    </QueryClientProvider>,
  );

describe("ProviderSpecialtiesCard (RR-3 in profile settings)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("saves the picked specialties with PUT /profile", async () => {
    api.put.mockResolvedValueOnce({ data: { data: {} } });
    renderCard();

    expect(screen.getByLabelText("DJ")).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByLabelText("Photography"));
    fireEvent.click(screen.getByText("Save Specialties"));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith("/profile", {
        specialties: ["dj", "photography"],
      }),
    );
    expect(toast.success).toHaveBeenCalledWith("Specialties saved");
  });

  it("won't save with none left", () => {
    renderCard();

    fireEvent.click(screen.getByLabelText("DJ"));
    fireEvent.click(screen.getByText("Save Specialties"));

    expect(api.put).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Keep at least one specialty.");
  });

  it("shows the API's reason when it refuses, and goes back to the saved list", async () => {
    api.put.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          message: "DJ has an upcoming booking and can't be removed yet.",
        },
      },
    });
    renderCard([
      { slug: "dj", name: "DJ" },
      { slug: "photography", name: "Photography" },
    ]);

    fireEvent.click(screen.getByLabelText("DJ"));
    fireEvent.click(screen.getByText("Save Specialties"));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "DJ has an upcoming booking and can't be removed yet.",
      ),
    );
    expect(screen.getByLabelText("DJ")).toHaveAttribute("aria-pressed", "true");
  });
});
