import { describe, it, expect } from "vitest";
import {
  checkUploadFile,
  FILE_UNSUPPORTED,
  UPLOAD_ACCEPT,
  isWordFile,
} from "../uploadRules";
import { portfolioUrlsError, splitPortfolioUrls } from "../portfolioUrls";

/**
 * app#371: a portfolio / resume is a PDF or Word document, never an image,
 * and portfolio links must be real web addresses.
 */

const DOCX =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const file = (type: string, name: string, size = 10) =>
  new File([new Uint8Array(size)], name, { type });

describe("portfolio uploads", () => {
  it("take a PDF, DOC or DOCX", () => {
    expect(
      checkUploadFile(file("application/pdf", "cv.pdf"), "portfolio"),
    ).toBeNull();
    expect(
      checkUploadFile(file("application/msword", "cv.doc"), "portfolio"),
    ).toBeNull();
    expect(checkUploadFile(file(DOCX, "cv.docx"), "portfolio")).toBeNull();
  });

  it("read a Word file the system gave no type by its name", () => {
    expect(checkUploadFile(file("", "cv.docx"), "portfolio")).toBeNull();
    expect(checkUploadFile(file("", "CV.DOC"), "portfolio")).toBeNull();
    expect(isWordFile(file("", "cv.docx"))).toBe(true);
  });

  it.each([
    ["image/png", "work.png"],
    ["image/jpeg", "work.jpg"],
    ["image/gif", "work.gif"],
    ["", "setup.exe"],
  ])("refuse %s %s", (type, name) => {
    expect(checkUploadFile(file(type, name), "portfolio")).toBe(
      FILE_UNSUPPORTED.portfolio,
    );
  });

  it("refuse one over 15MB", () => {
    expect(
      checkUploadFile(file(DOCX, "cv.docx", 16 * 1024 * 1024), "portfolio"),
    ).toMatch("15MB");
  });

  it("offer only documents in the picker", () => {
    expect(UPLOAD_ACCEPT.portfolio).toContain(".docx");
    expect(UPLOAD_ACCEPT.portfolio).toContain("application/pdf");
    expect(UPLOAD_ACCEPT.portfolio).not.toMatch(/image\//);
  });

  it("leave identity documents as they were", () => {
    expect(checkUploadFile(file(DOCX, "id.docx"), "document")).toBe(
      FILE_UNSUPPORTED.document,
    );
    expect(checkUploadFile(file("image/png", "id.png"), "document")).toBeNull();
  });
});

describe("portfolio links", () => {
  it("split on commas, trimmed, without blanks or repeats", () => {
    expect(
      splitPortfolioUrls(
        " https://a.example.com , ,https://a.example.com,https://b.example.com",
      ),
    ).toEqual(["https://a.example.com", "https://b.example.com"]);
  });

  it("accept an empty field and real web addresses", () => {
    expect(portfolioUrlsError("")).toBeNull();
    expect(
      portfolioUrlsError("https://behance.net/fox, http://fox.example.com"),
    ).toBeNull();
  });

  it.each([
    "behance.net/fox",
    "javascript:alert(1)",
    "ftp://files.example.com",
    "https://portfolio",
    "https://me:pw@example.com",
  ])("refuse %s", (link) => {
    expect(portfolioUrlsError(link)).not.toBeNull();
  });

  it("refuse more than five", () => {
    const six = [1, 2, 3, 4, 5, 6]
      .map((n) => `https://s${n}.example.com`)
      .join(",");
    expect(portfolioUrlsError(six)).toMatch("at most 5");
  });
});
