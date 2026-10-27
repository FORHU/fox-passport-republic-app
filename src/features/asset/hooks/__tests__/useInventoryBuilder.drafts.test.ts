import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";

/**
 * Gear drafts in the Studio: Save Draft → the form resets → make another.
 * A draft needs only a title (an image is needed only to publish), keeps an
 * image picked before saving, and each Save Draft is its own listing under
 * My Drafts. On the edit page an opened draft is updated in place instead.
 */

// Stable across renders, as Next's is: the hook re-initialises the store
// whenever the search params object changes.
const searchParams = new URLSearchParams();
const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => router,
  useSearchParams: () => searchParams,
}));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/shared/lib/axios", () => ({
  default: { get: vi.fn(async () => ({ data: { data: [] } })) },
}));

const assets = vi.hoisted(() => ({
  createAsset: vi.fn(),
  updateAsset: vi.fn(),
}));
vi.mock("@/features/asset/api/assets", () => assets);

const upload = vi.hoisted(() => ({ uploadFile: vi.fn() }));
vi.mock("@/shared/hooks/useFileUpload", () => ({
  useFileUpload: () => upload,
}));
vi.mock("@/shared/lib/imageFile", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/lib/imageFile")>()),
  imageUrlToFile: vi.fn(
    async () => new File(["x"], "asset.png", { type: "image/png" }),
  ),
}));

import { useInventoryBuilder } from "../useInventoryBuilder";
import { useListingBuilderStore } from "@/features/asset/store/useListingBuilderStore";
import { toast } from "sonner";

const IMAGE = "data:image/png;base64,AAAA";

function setUp() {
  const hook = renderHook(() => useInventoryBuilder());
  act(() => hook.result.current.setTitle("Test speaker"));
  return hook;
}

beforeEach(() => {
  vi.clearAllMocks();
  useListingBuilderStore.getState().reset();
  localStorage.setItem("fox_user", JSON.stringify({ id: "u1" }));
  assets.createAsset.mockResolvedValue({ id: "a1" });
  assets.updateAsset.mockResolvedValue({ id: "a1" });
  upload.uploadFile.mockResolvedValue({ fileId: "f1" });
});

describe("Gear Studio drafts", () => {
  it("links My Drafts to the Assets list", () => {
    const { result } = setUp();
    expect(result.current.myDraftsHref).toBe(
      "/creator-dashboard/assets?status=draft",
    );
  });

  it("saves a title-only draft, then resets the form", async () => {
    const { result } = setUp();
    act(() => result.current.setDescription("Loud"));

    await act(() => result.current.handleSaveDraft());

    expect(assets.createAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Test speaker",
        imgIds: [],
        status: "draft",
      }),
    );
    expect(upload.uploadFile).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(
      "Draft saved. Find it under My Drafts.",
    );
    expect(result.current.title).toBe("");
    expect(result.current.description).toBe("");
    expect(result.current.image).toBe("");
    expect(result.current.activeType).toBe("inventory");
    expect(result.current.error).toBeNull();
  });

  it("saves a picked image with the draft, then clears it", async () => {
    const { result } = setUp();
    act(() => result.current.setImage(IMAGE));

    await act(() => result.current.handleSaveDraft());

    expect(assets.createAsset).toHaveBeenCalledWith(
      expect.objectContaining({ imgIds: ["f1"], status: "draft" }),
    );
    expect(result.current.image).toBe("");
  });

  it("still saves the draft when the image upload fails", async () => {
    upload.uploadFile.mockResolvedValue(null);
    const { result } = setUp();
    act(() => result.current.setImage(IMAGE));

    await act(() => result.current.handleSaveDraft());

    expect(assets.createAsset).toHaveBeenCalledWith(
      expect.objectContaining({ imgIds: [] }),
    );
    expect(result.current.title).toBe("");
  });

  it("makes each Save Draft its own listing", async () => {
    const { result } = setUp();
    await act(() => result.current.handleSaveDraft());

    act(() => result.current.setTitle("Second speaker"));
    await act(() => result.current.handleSaveDraft());

    expect(assets.createAsset).toHaveBeenCalledTimes(2);
    expect(assets.createAsset).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: "Second speaker" }),
    );
    expect(assets.updateAsset).not.toHaveBeenCalled();
  });

  it("keeps the form when the save fails", async () => {
    assets.createAsset.mockRejectedValue(new Error("Network down"));
    const { result } = setUp();
    act(() => result.current.setImage(IMAGE));

    await act(() => result.current.handleSaveDraft());

    expect(result.current.error).toBe("Network down");
    expect(result.current.title).toBe("Test speaker");
    expect(result.current.image).toBe(IMAGE);
  });

  it("ignores a second click while the first save is in flight", async () => {
    let finish!: (v: unknown) => void;
    assets.createAsset.mockReturnValue(new Promise((r) => (finish = r)));
    const { result } = setUp();

    let first!: Promise<boolean>;
    await act(async () => {
      first = result.current.handleSaveDraft();
      await result.current.handleSaveDraft();
    });
    await act(async () => {
      finish({ id: "a1" });
      await first;
    });

    expect(assets.createAsset).toHaveBeenCalledOnce();
  });

  it("an adopted draft (edit page) is updated, not reset", async () => {
    const { result } = setUp();
    act(() => {
      result.current.adoptDraft("x9", "https://cdn/x9.png");
      result.current.setImage("https://cdn/x9.png");
    });

    await act(() => result.current.handleSaveDraft());

    expect(assets.createAsset).not.toHaveBeenCalled();
    expect(upload.uploadFile).not.toHaveBeenCalled();
    expect(assets.updateAsset).toHaveBeenCalledWith(
      "x9",
      expect.objectContaining({ name: "Test speaker", status: "draft" }),
    );
    expect(assets.updateAsset).toHaveBeenCalledWith(
      "x9",
      expect.not.objectContaining({ imgIds: expect.anything() }),
    );
    expect(result.current.title).toBe("Test speaker");
  });

  it("publishes a new listing, uploading its image once", async () => {
    const { result } = setUp();
    act(() => {
      result.current.setImage(IMAGE);
      result.current.setDescription("A loud speaker");
      result.current.setCategory("sound_system");
      result.current.setCondition("good");
      result.current.setPrice(500);
      result.current.setUnit("Per Item / Day");
    });

    await act(() => result.current.handlePublish());

    expect(assets.createAsset).toHaveBeenCalledOnce();
    expect(assets.createAsset).toHaveBeenCalledWith(
      expect.objectContaining({ imgIds: ["f1"] }),
    );
    expect(upload.uploadFile).toHaveBeenCalledOnce();
  });
});
