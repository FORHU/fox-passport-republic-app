import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useFileUpload } from "../useFileUpload";
import { FILE_EMPTY, FILE_UNSUPPORTED } from "@/shared/lib/uploadRules";

const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

const api = vi.hoisted(() => ({ post: vi.fn(), get: vi.fn() }));
vi.mock("@/shared/lib/axios", () => ({ default: api }));

const s3Put = vi.hoisted(() => vi.fn());
vi.mock("axios", () => ({ default: { put: s3Put } }));

const file = (type: string, size: number, name: string) =>
  new File([new Uint8Array(size)], name, { type });

beforeEach(() => vi.clearAllMocks());

describe("useFileUpload", () => {
  it("refuses an empty or unsupported file before any request", async () => {
    const { result } = renderHook(() => useFileUpload());

    expect(await result.current.uploadFile(file("image/jpeg", 0, "e.jpg"))).toBeNull();
    expect(toast.error).toHaveBeenLastCalledWith(FILE_EMPTY);

    expect(
      await result.current.uploadFile(file("image/heic", 10, "IMG.heic")),
    ).toBeNull();
    expect(toast.error).toHaveBeenLastCalledWith(FILE_UNSUPPORTED.image);

    expect(
      await result.current.uploadPrivateFile(file("", 10, "setup.exe")),
    ).toBeNull();
    expect(toast.error).toHaveBeenLastCalledWith(FILE_UNSUPPORTED.document);

    expect(api.post).not.toHaveBeenCalled();
    expect(s3Put).not.toHaveBeenCalled();
  });

  it("registers a presigned upload by its key, for the API to check", async () => {
    api.post
      .mockResolvedValueOnce({ data: { url: "https://s3/put", key: "users/u1/uploads/a.png" } })
      .mockResolvedValueOnce({ data: { file: { id: "f1", url: "https://cdn/a.png" } } });
    const { result } = renderHook(() => useFileUpload());

    const out = await result.current.uploadFile(file("image/png", 10, "a.png"));

    expect(out).toEqual({ fileId: "f1", url: "https://cdn/a.png", key: "users/u1/uploads/a.png" });
    expect(api.post).toHaveBeenNthCalledWith(1, "/s3/get-presigned-url", {
      originalFilename: "a.png",
      contentType: "image/png",
      sizeOfFile: 10,
    });
    expect(api.post).toHaveBeenNthCalledWith(2, "/files/create", {
      key: "users/u1/uploads/a.png",
      name: "a.png",
    });
    expect(api.get).not.toHaveBeenCalled();
  });

  it("shows the API's message when it refuses the upload", async () => {
    api.post
      .mockResolvedValueOnce({ data: { url: "https://s3/put", key: "k" } })
      .mockRejectedValueOnce({ response: { data: { message: FILE_UNSUPPORTED.image } } });
    const { result } = renderHook(() => useFileUpload());

    await act(async () => {
      expect(await result.current.uploadFile(file("image/jpeg", 10, "qa.jpg"))).toBeNull();
    });
    expect(toast.error).toHaveBeenLastCalledWith(FILE_UNSUPPORTED.image);
    // …and keeps it, for an uploader to show beside the field.
    expect(result.current.error).toBe(FILE_UNSUPPORTED.image);
  });
});
