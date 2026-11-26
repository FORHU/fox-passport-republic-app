import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { AdminSubmissionsTable } from "@/features/admin/components/AdminSubmissionsTable";

/**
 * api#423: an application claiming more than 30 years shows the claim, and
 * the admin either approves it (at the claim or at 30) or, when the CV and
 * references don't bear it out, lowers it to 30 and flags the CV.
 */

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const http = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }));
vi.mock("@/shared/lib/axios", () => ({ default: http }));

const cv = {
  id: "cv-1",
  url: "https://files.test/cv.pdf",
  name: "cv.pdf",
  type: "application/pdf",
};

const wordCv = {
  id: "cv-2",
  url: "https://files.test/cv.docx",
  name: "cv.docx",
  type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const application = (
  claimedExperience: number | null,
  experience: number,
  file: typeof cv = cv,
) => ({
  id: "req-1",
  roleType: "providerFoxer",
  status: "pending",
  createdAt: "2026-11-26T00:00:00.000Z",
  user: { id: "u1", name: "Rosa Reyes", email: "rosa@example.test" },
  providerFoxerApplication: {
    experience,
    claimedExperience,
    portfolioFile: claimedExperience ? file : null,
  },
});

const open = async (app: ReturnType<typeof application>) => {
  http.get.mockResolvedValue({ data: { data: [app] } });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    createElement(
      QueryClientProvider,
      { client },
      createElement(AdminSubmissionsTable),
    ),
  );
  fireEvent.click(await screen.findByText("Rosa Reyes"));
};

beforeEach(() => {
  http.get.mockReset();
  http.patch.mockReset().mockResolvedValue({ data: {} });
});

describe("a claim of more than 30 years", () => {
  it("shows the claim to check against the CV", async () => {
    await open(application(40, 40));
    expect(
      screen.getByText("Claims 40+ years — check the CV and its references"),
    ).toBeInTheDocument();
  });

  it("labels the CV and opens it from the claim", async () => {
    await open(application(40, 40));
    expect(screen.getByText("CV (claims 40+ years)")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Open CV/ }));
    // The preview opens on the CV itself.
    expect(screen.getByTitle("Open in new tab")).toHaveAttribute(
      "href",
      "https://files.test/cv.pdf",
    );
  });

  it("offers a Word CV as a download, not a broken image", async () => {
    await open(application(40, 40, wordCv));
    fireEvent.click(screen.getByRole("button", { name: /Open CV/ }));

    expect(
      screen.getByText("Word documents can't be previewed in the browser."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Download cv\.docx/ }),
    ).toHaveAttribute("href", "https://files.test/cv.docx");
    expect(screen.queryByRole("img", { name: "CV" })).toBeNull();
  });

  it("says when an earlier review lowered it to 30", async () => {
    await open(application(40, 30));
    expect(screen.getByText(/Currently 30 years/)).toBeInTheDocument();
  });

  it("approves at the claimed years", async () => {
    await open(application(40, 40));
    fireEvent.click(screen.getByText("Approve at 40+ years"));
    await waitFor(() =>
      expect(http.patch).toHaveBeenCalledWith("/role-requests/review/req-1", {
        status: "approved",
        experienceDecision: "claimed",
      }),
    );
  });

  it("approves at 30", async () => {
    await open(application(40, 40));
    fireEvent.click(screen.getByText("Approve at 30 years"));
    await waitFor(() =>
      expect(http.patch).toHaveBeenCalledWith("/role-requests/review/req-1", {
        status: "approved",
        experienceDecision: "base",
      }),
    );
  });

  it("lowers it to 30 and flags the CV, with a note", async () => {
    await open(application(40, 40));
    fireEvent.click(screen.getByText("Can't confirm CV"));

    // The CV comes pre-flagged and the claim pre-lowered.
    const cvFlag = screen.getByRole("checkbox", { name: "Portfolio / Resume" });
    expect(cvFlag).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: /Can't confirm the 40\+ claim/ }),
    ).toBeChecked();

    // A note is required, so the applicant knows what the CV is missing.
    const send = screen.getByRole("button", { name: /Request Revision/ });
    expect(send).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText(/Explain what's wrong/), {
      target: { value: "The references could not be reached." },
    });
    fireEvent.click(send);

    await waitFor(() =>
      expect(http.patch).toHaveBeenCalledWith("/role-requests/review/req-1", {
        status: "revision_requested",
        flaggedDocuments: ["portfolioFile"],
        revisionNote: "The references could not be reached.",
        experienceDecision: "base",
      }),
    );
  });

  it("offers no separate Approve at 30 for a 30+ claim", async () => {
    await open(application(30, 30));
    expect(
      screen.getByText("Claims 30+ years — check the CV and its references"),
    ).toBeInTheDocument();
    expect(screen.getByText("Approve at 30+ years")).toBeInTheDocument();
    expect(screen.queryByText("Approve at 30 years")).toBeNull();
  });

  it("shows 50 without a plus", async () => {
    await open(application(50, 50));
    expect(screen.getByText("Approve at 50 years")).toBeInTheDocument();
  });

  it("keeps a single Approve when nothing over 30 is claimed", async () => {
    await open(application(null, 12));
    expect(screen.getByText("Approve")).toBeInTheDocument();
    expect(screen.queryByText(/Approve at/)).toBeNull();
    expect(screen.queryByText(/Claims/)).toBeNull();
  });
});
