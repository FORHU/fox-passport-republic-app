import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilePreviewModal, getPreviewKind } from "../FilePreviewModal";

// PDF.js needs a real canvas and worker; jsdom has neither.
vi.mock("@/shared/components/ui/PdfPreview", () => ({
  PdfPreview: () => createElement("div", { "data-testid": "pdf-preview" }),
}));

describe("getPreviewKind", () => {
  it.each([
    ["image/png", "id.png", "image"],
    ["image/jpeg", "selfie.jpg", "image"],
    ["application/pdf", "nbi.pdf", "pdf"],
    ["", "nbi.PDF", "pdf"],
    ["", "selfie.jpeg", "image"],
    ["image/heic", "IMG_0001.heic", "unsupported"],
    ["image/tiff", "scan.tiff", "unsupported"],
    ["application/zip", "docs.zip", "unsupported"],
  ])("%s %s → %s", (type, name, kind) => {
    expect(getPreviewKind(type, name)).toBe(kind);
  });

  it("trusts the reported type over the file name", () => {
    expect(getPreviewKind("image/heic", "renamed.jpg")).toBe("unsupported");
  });
});

describe("FilePreviewModal", () => {
  const url = "blob:preview";

  it("shows an image inline", () => {
    render(
      <FilePreviewModal
        url={url}
        name="id.png"
        type="image/png"
        label="Primary Valid ID"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByAltText("Primary Valid ID")).toHaveAttribute("src", url);
  });

  it("renders a PDF with the PDF viewer", () => {
    render(
      <FilePreviewModal
        url={url}
        name="nbi.pdf"
        type="application/pdf"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByTestId("pdf-preview")).toBeInTheDocument();
  });

  it("offers a download for a type it can't show", () => {
    render(
      <FilePreviewModal
        url={url}
        name="IMG_0001.heic"
        type="image/heic"
        onClose={vi.fn()}
      />,
    );
    expect(
      screen.getByText("We can't preview this file type here"),
    ).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /download file/i });
    expect(link).toHaveAttribute("href", url);
    expect(link).toHaveAttribute("download", "IMG_0001.heic");
  });

  it("falls back to the download view when an image won't load", () => {
    render(
      <FilePreviewModal
        url={url}
        name="broken.png"
        type="image/png"
        onClose={vi.fn()}
      />,
    );
    fireEvent.error(screen.getByAltText("broken.png"));
    expect(
      screen.getByRole("link", { name: /download file/i }),
    ).toBeInTheDocument();
  });

  it("closes with the close button, Escape, or a backdrop click", () => {
    const onClose = vi.fn();
    render(
      <FilePreviewModal
        url={url}
        name="id.png"
        type="image/png"
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Close preview" }));
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("locks page scroll while open and restores it after", () => {
    const { unmount } = render(
      <FilePreviewModal
        url={url}
        name="id.png"
        type="image/png"
        onClose={vi.fn()}
      />,
    );
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
