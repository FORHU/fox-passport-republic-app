import { describe, it, expect } from "vitest";
import { isVideoUrl } from "../media";

describe("isVideoUrl", () => {
  it.each([".mp4", ".mov", ".webm", ".m4v"])("treats %s as a video", (ext) => {
    expect(isVideoUrl(`https://cdn.test/users/u1/uploads/clip${ext}`)).toBe(
      true,
    );
  });

  it("ignores case and a query string", () => {
    expect(isVideoUrl("https://cdn.test/CLIP.MP4?X-Amz-Expires=3600")).toBe(
      true,
    );
  });

  it.each([
    "https://cdn.test/photo.jpg",
    "https://cdn.test/photo.webp?v=2",
    "https://cdn.test/mp4/photo.png",
  ])("treats %s as not a video", (url) => {
    expect(isVideoUrl(url)).toBe(false);
  });
});
