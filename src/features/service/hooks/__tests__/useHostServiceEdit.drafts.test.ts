import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

/**
 * A Talent draft reopened in its editor: Save Draft updates that draft (it
 * used to create a second listing), and Publish sends it to admin review as
 * "pending" (it used to send "active", which the API rejects). A live
 * listing's choice is translated to the API's ServiceStatus.
 */

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useQuery: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/shared/lib/axios", () => ({
  default: { get: vi.fn(async () => ({ data: { data: [] } })) },
}));
vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: (select: (s: unknown) => unknown) =>
    select({ user: { id: "u1" } }),
}));

const services = vi.hoisted(() => ({
  createService: vi.fn(),
  updateService: vi.fn(),
  fetchServicesByOwnerId: vi.fn(),
  fetchServiceById: vi.fn(),
}));
vi.mock("@/features/service/api/services", () => services);

const upload = vi.hoisted(() => ({ uploadFile: vi.fn() }));
vi.mock("@/shared/hooks/useFileUpload", () => ({
  useFileUpload: () => upload,
}));

import { useHostServiceEdit } from "../useHostServiceEdit";
import { useListingBuilderStore } from "@/shared/store/useListingBuilderStore";

const LISTING = {
  id: "s1",
  ownerId: "u1",
  name: "Event photography",
  description: "Weddings and launches",
  category: "other",
  price: 1500,
  billingRate: "hourly",
  images: [{ url: "https://cdn/s1.png" }],
};

async function open(status: string) {
  services.fetchServicesByOwnerId.mockResolvedValue([{ ...LISTING, status }]);
  const hook = renderHook(() => useHostServiceEdit("s1"));
  await waitFor(() => expect(hook.result.current.isPrefilling).toBe(false));
  return hook;
}

beforeEach(() => {
  vi.clearAllMocks();
  useListingBuilderStore.getState().reset();
  localStorage.setItem("fox_user", JSON.stringify({ id: "u1" }));
  services.updateService.mockResolvedValue({ id: "s1" });
  upload.uploadFile.mockResolvedValue({ fileId: "f1" });
});

describe("editing a Talent draft", () => {
  it("Save Draft updates the open draft instead of creating one", async () => {
    const { result } = await open("draft");
    expect(result.current.isDraft).toBe(true);

    act(() => result.current.setTitle("Wedding photography"));
    await act(() => result.current.handleSaveDraft());

    expect(services.createService).not.toHaveBeenCalled();
    expect(services.updateService).toHaveBeenCalledWith(
      "s1",
      expect.objectContaining({
        name: "Wedding photography",
        status: "draft",
      }),
    );
    expect(upload.uploadFile).not.toHaveBeenCalled();
    // Unlike the Studio, the editor keeps showing the draft after saving.
    expect(result.current.title).toBe("Wedding photography");
  });

  it("Publish sends the draft to review", async () => {
    const { result } = await open("draft");

    await act(() => result.current.handlePublish());

    expect(services.updateService).toHaveBeenCalledWith(
      "s1",
      expect.objectContaining({ status: "pending" }),
    );
  });

  it("a live listing is saved with the API's own status names", async () => {
    const { result } = await open("available");
    expect(result.current.isDraft).toBe(false);
    expect(result.current.status).toBe("active");

    await act(() => result.current.handlePublish());

    expect(services.updateService).toHaveBeenCalledWith(
      "s1",
      expect.objectContaining({ status: "available" }),
    );
  });
});
