import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FileUploader from "../FileUploader";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const upload = vi.hoisted(() => ({
  uploadFile: vi.fn(),
  uploadPrivateFile: vi.fn(),
}));
vi.mock("@/shared/hooks/useFileUpload", () => ({
  useFileUpload: () => upload,
}));

vi.mock("@/shared/components/ui/PdfPreview", () => ({
  PdfPreview: () => createElement("div", { "data-testid": "pdf-preview" }),
}));

describe("FileUploader preview", () => {
  const createObjectURL = vi.fn(() => "blob:preview");
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    upload.uploadPrivateFile.mockResolvedValue({ fileId: "file-1" });
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  async function uploadId(file: File) {
    const onUploadComplete = vi.fn();
    const { container } = render(
      <FileUploader
        label="Primary Valid ID"
        onUploadComplete={onUploadComplete}
        private
      />,
    );
    const input = container.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [file] } });
    await screen.findByText("Uploaded Successfully");
    return onUploadComplete;
  }

  it("previews the picked file and keeps the upload when closed", async () => {
    const file = new File(["id"], "id.png", { type: "image/png" });
    const onUploadComplete = await uploadId(file);

    fireEvent.click(screen.getByRole("button", { name: "Preview id.png" }));
    expect(createObjectURL).toHaveBeenCalledWith(file);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByAltText("Primary Valid ID")).toHaveAttribute(
      "src",
      "blob:preview",
    );

    fireEvent.click(screen.getByRole("button", { name: "Close preview" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    expect(screen.getByText("Uploaded Successfully")).toBeInTheDocument();
    expect(onUploadComplete).toHaveBeenCalledOnce();
  });

  it("opens from the eye button too", async () => {
    await uploadId(new File(["%PDF"], "nbi.pdf", { type: "application/pdf" }));

    fireEvent.click(screen.getByRole("button", { name: "Preview file" }));
    expect(screen.getByTestId("pdf-preview")).toBeInTheDocument();
  });
});
