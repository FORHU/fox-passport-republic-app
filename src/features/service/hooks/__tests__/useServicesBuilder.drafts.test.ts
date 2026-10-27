import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";

/**
 * Talent drafts in the Studio: Save Draft → the form resets → make another.
 * A draft needs only a title (an image is needed only to publish), and each
 * Save Draft is its own listing under My Drafts. On the edit page an opened
 * draft is updated in place instead.
 */

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/shared/lib/axios", () => ({
  default: { get: vi.fn(async () => ({ data: { data: [] } })) },
}));

const services = vi.hoisted(() => ({
  createService: vi.fn(),
  updateService: vi.fn(),
}));
vi.mock("@/features/service/api/services", () => services);

const upload = vi.hoisted(() => ({ uploadFile: vi.fn() }));
vi.mock("@/shared/hooks/useFileUpload", () => ({
  useFileUpload: () => upload,
}));
vi.mock("@/shared/lib/imageFile", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/lib/imageFile")>()),
  imageUrlToFile: vi.fn(
    async () => new File(["x"], "service.png", { type: "image/png" }),
  ),
}));

import { useServicesBuilder } from "../useServicesBuilder";
import { useListingBuilderStore } from "@/shared/store/useListingBuilderStore";
import { toast } from "sonner";

const IMAGE = "data:image/png;base64,AAAA";

function setUp() {
  const hook = renderHook(() => useServicesBuilder());
  act(() => hook.result.current.setTitle("Event photography"));
  return hook;
}

beforeEach(() => {
  vi.clearAllMocks();
  useListingBuilderStore.getState().reset();
  localStorage.setItem("fox_user", JSON.stringify({ id: "u1" }));
  services.createService.mockResolvedValue({ id: "s1" });
  services.updateService.mockResolvedValue({ id: "s1" });
  upload.uploadFile.mockResolvedValue({ fileId: "f1" });
});

describe("Talent Studio drafts", () => {
  it("links My Drafts to the Services list", () => {
    const { result } = setUp();
    expect(result.current.myDraftsHref).toBe(
      "/creator-dashboard/services?status=draft",
    );
  });

  it("saves a draft with its image, then resets the form", async () => {
    const { result } = setUp();
    act(() => result.current.setImage(IMAGE));

    await act(() => result.current.handleSaveDraft());

    expect(services.createService).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Event photography",
        imgIds: ["f1"],
        status: "draft",
      }),
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Draft saved. Find it under My Drafts.",
    );
    expect(result.current.title).toBe("");
    expect(result.current.image).toBe("");
    expect(result.current.activeType).toBe("service");
  });

  it("makes each Save Draft its own listing", async () => {
    const { result } = setUp();
    await act(() => result.current.handleSaveDraft());

    act(() => result.current.setTitle("DJ for weddings"));
    await act(() => result.current.handleSaveDraft());

    expect(services.createService).toHaveBeenCalledTimes(2);
    expect(services.updateService).not.toHaveBeenCalled();
  });

  it("keeps the form when the save fails", async () => {
    services.createService.mockRejectedValue(new Error("Network down"));
    const { result } = setUp();

    await act(() => result.current.handleSaveDraft());

    expect(result.current.error).toBe("Network down");
    expect(result.current.title).toBe("Event photography");
  });

  it("an adopted draft (edit page) is updated, not reset", async () => {
    const { result } = setUp();
    act(() => result.current.adoptDraft("s9"));

    await act(() => result.current.handleSaveDraft());

    expect(services.createService).not.toHaveBeenCalled();
    expect(services.updateService).toHaveBeenCalledWith(
      "s9",
      expect.objectContaining({ status: "draft" }),
    );
    expect(result.current.title).toBe("Event photography");
  });

  it("publishes a new listing, uploading its image once", async () => {
    const { result } = setUp();
    act(() => {
      result.current.setImage(IMAGE);
      result.current.setDescription("Weddings and launches");
      result.current.setCategory("other");
      result.current.setPrice(1500);
    });

    await act(() => result.current.handlePublish());

    expect(services.createService).toHaveBeenCalledOnce();
    expect(services.createService).toHaveBeenCalledWith(
      expect.objectContaining({ imgIds: ["f1"] }),
    );
    expect(upload.uploadFile).toHaveBeenCalledOnce();
  });
});
