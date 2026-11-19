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
// The catalog has a row (with an id) for each Studio category.
vi.mock("@/shared/lib/axios", () => ({
  default: {
    get: vi.fn(async () => ({
      data: { data: [{ id: 12, slug: "catering" }] },
    })),
  },
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
import api from "@/shared/lib/axios";

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

  // The API refuses a blank description; leaving it out lets a draft save.
  it("sends no description when the draft has none", async () => {
    const { result } = setUp();

    await act(() => result.current.handleSaveDraft());

    const payload = services.createService.mock.calls[0][0];
    expect(payload).toMatchObject({
      name: "Event photography",
      status: "draft",
    });
    expect(payload.description).toBeUndefined();
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

// The API accepts only ServiceCategory slugs; a catalog id is a 400 (#321).
describe("Service Studio category", () => {
  // Let anything the hook loads on mount (it used to load the catalog to swap
  // slugs for ids) settle first, as it has on a real page by the time a
  // Provider clicks.
  async function setUpLoaded() {
    const hook = setUp();
    await act(async () => {});
    return hook;
  }

  it("publishes with the picked slug", async () => {
    const { result } = await setUpLoaded();
    act(() => {
      result.current.setImage(IMAGE);
      result.current.setDescription("Buffet for 100");
      result.current.setCategory("catering");
      result.current.setPrice(1500);
    });

    await act(() => result.current.handlePublish());

    expect(services.createService).toHaveBeenCalledWith(
      expect.objectContaining({ category: "catering" }),
    );
  });

  it("saves a new draft with the picked slug", async () => {
    const { result } = await setUpLoaded();
    act(() => result.current.setCategory("catering"));

    await act(() => result.current.handleSaveDraft());

    expect(services.createService).toHaveBeenCalledWith(
      expect.objectContaining({ category: "catering" }),
    );
  });

  it("doesn't load the category catalog", async () => {
    await setUpLoaded();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("updates an adopted draft with the picked slug", async () => {
    const { result } = await setUpLoaded();
    act(() => {
      result.current.adoptDraft("s9");
      result.current.setCategory("catering");
    });

    await act(() => result.current.handleSaveDraft());

    expect(services.updateService).toHaveBeenCalledWith(
      "s9",
      expect.objectContaining({ category: "catering" }),
    );
  });
});

// app#323: a published service carried no status, so the API saved a draft.
describe("Service Studio Initial Status", () => {
  function fillForPublish(result: ReturnType<typeof setUp>["result"]) {
    act(() => {
      result.current.setImage(IMAGE);
      result.current.setDescription("Weddings and launches");
      result.current.setCategory("other");
      result.current.setPrice(1500);
    });
  }

  it("opens with Active checked and publishes it as available", async () => {
    const { result } = setUp();
    expect(result.current.status).toBe("active");
    fillForPublish(result);

    await act(() => result.current.handlePublish());

    expect(services.createService).toHaveBeenCalledWith(
      expect.objectContaining({ status: "available" }),
    );
  });

  it.each([
    ["paused", "paused"],
    ["unavailable", "archived"],
  ])("sends %s as the API's %s", async (picked, sent) => {
    const { result } = setUp();
    fillForPublish(result);
    act(() => result.current.setStatus(picked));

    await act(() => result.current.handlePublish());

    expect(services.createService).toHaveBeenCalledWith(
      expect.objectContaining({ status: sent }),
    );
  });

  it("refuses to publish a status that isn't an option", async () => {
    const { result } = setUp();
    fillForPublish(result);
    act(() => result.current.setStatus("draft"));

    await act(() => result.current.handlePublish());

    expect(result.current.error).toBe("Pick an Initial Status");
    expect(services.createService).not.toHaveBeenCalled();
  });
});

// app#326: every "add a gig" button opens the Studio with `?type=performer`.
describe("Gig Studio (performer mode)", () => {
  it("offers the performer categories, and Add Service keeps its own", () => {
    const gig = renderHook(() => useServicesBuilder({ mode: "performer" }));
    expect(gig.result.current.mode).toBe("performer");
    expect(gig.result.current.categories.map((c) => c.id)).toEqual([
      "dj",
      "live_band",
      "photography",
      "videography",
      "mc",
    ]);
    gig.unmount();

    const service = renderHook(() => useServicesBuilder());
    expect(service.result.current.mode).toBe("service");
    expect(service.result.current.categories.map((c) => c.id)).toEqual([
      "design",
      "catering",
      "service_staff",
      "other",
    ]);
  });

  it("publishes a gig with its performer slug", async () => {
    const { result } = renderHook(() =>
      useServicesBuilder({ mode: "performer" }),
    );
    act(() => {
      result.current.setTitle("Wedding DJ set");
      result.current.setDescription("Four hours, sound included");
      result.current.handleCategorySelect("dj");
      result.current.setPrice(8000);
      result.current.setImage(IMAGE);
    });
    expect(result.current.displayCategory).toBe("DJ");

    await act(() => result.current.handlePublish());

    expect(services.createService).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Wedding DJ set", category: "dj" }),
    );
  });
});
