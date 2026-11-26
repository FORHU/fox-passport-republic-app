import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createElement } from "react";
import ExperienceClaim from "@/features/role-application/components/ExperienceClaim";

/**
 * api#423: "I have more than 30 years of experience" asks for a CV with
 * references; unticking drops it.
 */

const uploader = vi.hoisted(() => ({
  validateFile: null as ((file: File) => string | null) | null,
}));

vi.mock("@/shared/components/layout/FileUploader", () => ({
  default: ({
    label,
    purpose,
    accept,
    validateFile,
    onUploadComplete,
  }: {
    label: string;
    purpose: string;
    accept: string;
    validateFile: (file: File) => string | null;
    onUploadComplete: (id: string) => void;
  }) => {
    uploader.validateFile = validateFile;
    return createElement(
      "button",
      {
        type: "button",
        "data-purpose": purpose,
        "data-accept": accept,
        onClick: () => onUploadComplete("cv-file"),
      },
      label,
    );
  },
}));

const setup = (claiming: boolean, years = "") => {
  const handlers = {
    onClaimingChange: vi.fn(),
    onCvUploaded: vi.fn(),
    onCvCleared: vi.fn(),
  };
  render(createElement(ExperienceClaim, { claiming, years, ...handlers }));
  return handlers;
};

describe("ExperienceClaim", () => {
  it("asks for no CV until more than 30 years is claimed", () => {
    setup(false);
    expect(
      screen.getByLabelText(/I have more than 30 years of experience/),
    ).not.toBeChecked();
    expect(screen.queryByText(/CV with references/)).toBeNull();
  });

  it("claims more than 30 years when ticked, with no earlier file as the CV", () => {
    const { onClaimingChange, onCvCleared } = setup(false);
    fireEvent.click(
      screen.getByLabelText(/I have more than 30 years of experience/),
    );
    expect(onClaimingChange).toHaveBeenCalledWith(true);
    // An earlier Event Foxer portfolio may be Word: the CV starts afresh.
    expect(onCvCleared).toHaveBeenCalled();
  });

  it("asks for a CV with references once claimed", () => {
    const { onCvUploaded } = setup(true);
    expect(screen.getByText(/at least 2 references/)).toBeInTheDocument();
    const upload = screen.getByText("CV with references (PDF) *");
    expect(upload).toHaveAttribute("data-purpose", "portfolio");
    expect(upload).toHaveAttribute("data-accept", "application/pdf");
    fireEvent.click(upload);
    expect(onCvUploaded).toHaveBeenCalledWith("cv-file");
  });

  it("takes the CV as a PDF only", () => {
    setup(true);
    const check = uploader.validateFile!;
    expect(
      check(new File(["%PDF"], "cv.pdf", { type: "application/pdf" })),
    ).toBeNull();
    expect(
      check(
        new File(["PK"], "cv.docx", {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
      ),
    ).toBe("Upload your CV as a PDF");
  });

  it("shows the bracket a typed claim counts as", () => {
    setup(true, "42");
    expect(screen.getByText(/42 years counts as/)).toHaveTextContent(
      "42 years counts as 40+. Experience over 30 is grouped: 30+, 35+, 40+, 45+, 50.",
    );
  });

  it("shows no bracket until more than 30 is typed", () => {
    setup(true, "30");
    expect(screen.queryByText(/counts as/)).toBeNull();
  });

  it("drops the CV with the claim when unticked", () => {
    const { onClaimingChange, onCvCleared } = setup(true);
    fireEvent.click(
      screen.getByLabelText(/I have more than 30 years of experience/),
    );
    expect(onCvCleared).toHaveBeenCalled();
    expect(onClaimingChange).toHaveBeenCalledWith(false);
  });
});
