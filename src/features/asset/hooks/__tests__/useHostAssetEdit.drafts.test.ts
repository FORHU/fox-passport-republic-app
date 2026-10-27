import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

/**
 * A Gear draft reopened in its editor: Save Draft updates that draft (it used
 * to create a second listing), and Publish sends it to admin review as
 * "pending" (it used to go out as "available", skipping review). A live
 * listing keeps the status its owner picks.
 */

const searchParams = new URLSearchParams();
const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => router,
  useSearchParams: () => searchParams,
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

const assets = vi.hoisted(() => ({
  createAsset: vi.fn(),
  updateAsset: vi.fn(),
  fetchAssetsByOwnerId: vi.fn(),
  fetchAssetById: vi.fn(),
}));
vi.mock("@/features/asset/api/assets", () => assets);

const upload = vi.hoisted(() => ({ uploadFile: vi.fn() }));
vi.mock("@/shared/hooks/useFileUpload", () => ({
  useFileUpload: () => upload,
}));

import { useHostAssetEdit } from "../useHostAssetEdit";
import { useListingBuilderStore } from "@/features/asset/store/useListingBuilderStore";

const LISTING = {
  id: "a1",
  ownerId: "u1",
  name: "Draft speaker",
  description: "Loud",
  category: "sound_system",
  condition: "good",
  price: 500,
  billingRate: "daily",
  images: [{ url: "https://cdn/a1.png" }],
};

async function open(status: string) {
  assets.fetchAssetsByOwnerId.mockResolvedValue([{ ...LISTING, status }]);
  const hook = renderHook(() => useHostAssetEdit("a1"));
  await waitFor(() => expect(hook.result.current.isPrefilling).toBe(false));
  return hook;
}

beforeEach(() => {
  vi.clearAllMocks();
  useListingBuilderStore.getState().reset();
  localStorage.setItem("fox_user", JSON.stringify({ id: "u1" }));
  assets.updateAsset.mockResolvedValue({ id: "a1" });
  upload.uploadFile.mockResolvedValue({ fileId: "f1" });
});

describe("editing a Gear draft", () => {
  it("Save Draft updates the open draft instead of creating one", async () => {
    const { result } = await open("draft");
    expect(result.current.isDraft).toBe(true);

    act(() => result.current.setTitle("Draft speaker v2"));
    await act(() => result.current.handleSaveDraft());

    expect(assets.createAsset).not.toHaveBeenCalled();
    expect(assets.updateAsset).toHaveBeenCalledWith(
      "a1",
      expect.objectContaining({ name: "Draft speaker v2", status: "draft" }),
    );
    // Its image is already on the listing.
    expect(upload.uploadFile).not.toHaveBeenCalled();
    // Unlike the Studio, the editor keeps showing the draft after saving.
    expect(result.current.title).toBe("Draft speaker v2");
  });

  it("Publish sends the draft to review", async () => {
    const { result } = await open("draft");

    await act(() => result.current.handlePublish());

    expect(assets.updateAsset).toHaveBeenCalledWith(
      "a1",
      expect.objectContaining({ status: "pending" }),
    );
  });

  it("a live listing keeps its status and offers no Save Draft", async () => {
    const { result } = await open("available");
    expect(result.current.isDraft).toBe(false);

    await act(() => result.current.handlePublish());

    expect(assets.updateAsset).toHaveBeenCalledWith(
      "a1",
      expect.objectContaining({ status: "available" }),
    );
  });

  it("an archived listing comes back as unavailable and stays archived", async () => {
    const { result } = await open("archived");
    expect(result.current.status).toBe("unavailable");

    await act(() => result.current.handlePublish());

    expect(assets.updateAsset).toHaveBeenCalledWith(
      "a1",
      expect.objectContaining({ status: "archived" }),
    );
  });
});
