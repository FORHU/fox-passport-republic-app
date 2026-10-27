import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AvatarUploader from "../AvatarUploader";

/**
 * QA (File Upload Validation / UI): when the API refused a photo, the text
 * under the avatar only said "Upload failed — please try again".
 */

const SERVER_REASON = "Use a JPG, PNG, WebP or GIF image";
vi.mock("@/shared/hooks/useFileUpload", () => ({
  useFileUpload: () => ({
    uploadFile: vi.fn(async () => null),
    isUploading: false,
    error: SERVER_REASON,
  }),
}));

describe("AvatarUploader", () => {
  it("shows the API's reason under the avatar when it refuses the photo", async () => {
    URL.createObjectURL = vi.fn(() => "blob:preview");
    URL.revokeObjectURL = vi.fn();
    const { container } = render(
      <AvatarUploader initials="JP" onUploaded={vi.fn()} />,
    );
    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [new File(["text"], "qa.jpg", { type: "image/jpeg" })] },
    });
    expect(await screen.findByText(SERVER_REASON)).toBeInTheDocument();
    expect(screen.queryByText(/Upload failed/)).toBeNull();
  });
});
