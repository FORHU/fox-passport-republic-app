import { describe, it, expect } from "vitest";
import {
  checkUploadFile,
  FILE_EMPTY,
  FILE_UNSUPPORTED,
  UPLOAD_ACCEPT,
} from "../uploadRules";

const file = (type: string, size = 10, name = "f") =>
  new File([new Uint8Array(size)], name, { type });

describe("checkUploadFile", () => {
  it("refuses an empty file", () => {
    expect(checkUploadFile(file("image/jpeg", 0, "empty.jpg"), "image")).toBe(
      FILE_EMPTY,
    );
  });

  it("refuses HEIC with the supported-formats message", () => {
    expect(checkUploadFile(file("image/heic", 10, "IMG.heic"), "image")).toBe(
      FILE_UNSUPPORTED.image,
    );
  });

  it("refuses a file with no recognised type", () => {
    expect(checkUploadFile(file("", 10, "setup.exe"), "media")).toBe(
      FILE_UNSUPPORTED.media,
    );
  });

  it("takes what each purpose allows, and nothing else", () => {
    expect(checkUploadFile(file("video/mp4"), "media")).toBeNull();
    expect(checkUploadFile(file("video/mp4"), "image")).toBe(
      FILE_UNSUPPORTED.image,
    );
    expect(checkUploadFile(file("application/pdf"), "document")).toBeNull();
    expect(checkUploadFile(file("application/pdf"), "image")).toBe(
      FILE_UNSUPPORTED.image,
    );
  });

  it("caps images at 15MB, as the API does", () => {
    expect(checkUploadFile(file("image/png", 15 * 1024 * 1024), "image")).toBeNull();
    expect(
      checkUploadFile(file("image/png", 15 * 1024 * 1024 + 1), "image"),
    ).toBe("File size must be 15MB or below");
  });

  it("offers pickers only the supported formats", () => {
    expect(UPLOAD_ACCEPT.image).not.toContain("*");
    expect(UPLOAD_ACCEPT.image.split(",")).not.toContain("image/heic");
  });
});
