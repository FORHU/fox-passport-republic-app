import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * api#367: an applicant withdraws a role application that no admin has
 * decided yet, from the onboarding "Under Review" card or the fix-documents
 * page, and the admin list shows it as Withdrawn.
 */

const api = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }));
vi.mock("@/shared/lib/axios", () => ({ default: api }));

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/onboarding",
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/shared/auth/RequireAuth", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: () => ({ user: null, setUser: vi.fn() }),
}));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

import OnboardingClient from "@/features/onboarding/components/OnboardingClient";
import ResubmitDocumentsClient from "@/features/role-application/components/ResubmitDocumentsClient";
import { AdminSubmissionsTable } from "@/features/admin/components/AdminSubmissionsTable";
import { requestStatus } from "@/app/kyc/_components/requestStatus";

const USER = {
  id: "u1",
  name: "Ana",
  country: "Philippines",
  city: "Makati",
  roleType: ["citizen"],
};

function myRequests(requests: object[]) {
  api.get.mockImplementation(async (url: string) =>
    url === "/role-requests/my"
      ? { data: { data: requests } }
      : { data: { data: [] } },
  );
}

/** The confirm button inside the "Withdraw …?" dialog. */
async function confirmWithdraw() {
  const dialog = await screen.findByRole("dialog");
  fireEvent.click(
    within(dialog).getByRole("button", { name: "Withdraw application" }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  api.patch.mockResolvedValue({ data: { success: true } });
});
afterEach(cleanup);

describe("Onboarding: an application under review", () => {
  it("offers Withdraw, and the role can be applied for again", async () => {
    myRequests([{ id: "req-1", roleType: "eventFoxer", status: "pending" }]);
    render(<OnboardingClient user={USER} />);

    expect(await screen.findByText("Under Review")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Withdraw application" }),
    );
    await confirmWithdraw();

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith("/role-requests/req-1/withdraw"),
    );
    await waitFor(() => expect(screen.queryByText("Under Review")).toBeNull());
    expect(toast.success).toHaveBeenCalledWith("Application withdrawn");
    expect(screen.getAllByText("Learn more & apply").length).toBeGreaterThan(0);
  });

  it("keeps it when the applicant cancels", async () => {
    myRequests([{ id: "req-1", roleType: "eventFoxer", status: "pending" }]);
    render(<OnboardingClient user={USER} />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Withdraw application" }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Keep it" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(api.patch).not.toHaveBeenCalled();
    expect(screen.getByText("Under Review")).toBeTruthy();
  });

  it("shows the API's reason and reloads when it was decided meanwhile", async () => {
    myRequests([{ id: "req-1", roleType: "eventFoxer", status: "pending" }]);
    api.patch.mockRejectedValue({
      response: {
        status: 400,
        data: {
          message:
            "This application was already approved and can't be withdrawn",
        },
      },
    });
    render(<OnboardingClient user={USER} />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Withdraw application" }),
    );
    await confirmWithdraw();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "This application was already approved and can't be withdrawn",
      ),
    );
    // Once on load, once to show where it stands now.
    expect(
      api.get.mock.calls.filter(([url]) => url === "/role-requests/my"),
    ).toHaveLength(2);
  });

  it("names each application when one card covers two", async () => {
    myRequests([
      { id: "req-p", roleType: "providerFoxer", status: "pending" },
      { id: "req-o", roleType: "organizer", status: "pending" },
    ]);
    render(<OnboardingClient user={USER} />);

    expect(
      await screen.findByRole("button", {
        name: "Withdraw Provider Foxer application",
      }),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Withdraw Event Coordinator application",
      }),
    );
    await confirmWithdraw();

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith("/role-requests/req-o/withdraw"),
    );
  });
});

describe("Fix-documents page", () => {
  it("withdraws an application sent back for revision", async () => {
    myRequests([
      {
        id: "req-r",
        roleType: "venueFoxer",
        status: "revision_requested",
        flaggedDocuments: ["nbiFile"],
      },
    ]);
    render(<ResubmitDocumentsClient requestId="req-r" />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Withdraw application" }),
    );
    await confirmWithdraw();

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith("/role-requests/req-r/withdraw"),
    );
    await waitFor(() => expect(push).toHaveBeenCalledWith("/onboarding"));
  });
});

describe("My verification page", () => {
  it("labels a withdrawn application instead of crashing", () => {
    expect(requestStatus("withdrawn")).toEqual({
      label: "Withdrawn",
      color: "var(--muted-foreground)",
    });
  });

  it("shows a status it doesn't know yet as is", () => {
    expect(requestStatus("expired").label).toBe("expired");
  });
});

describe("Admin Role Applications", () => {
  it("shows a withdrawn application as Withdrawn, not pending", async () => {
    api.get.mockResolvedValue({
      data: {
        data: [
          {
            id: "req-1",
            userId: "u1",
            roleType: "eventFoxer",
            status: "withdrawn",
            createdAt: "2026-11-26T00:00:00Z",
            user: { id: "u1", name: "Ana", email: "ana@test.com" },
          },
        ],
      },
    });
    render(
      <QueryClientProvider client={new QueryClient()}>
        <AdminSubmissionsTable />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Ana")).toBeTruthy();
    expect(screen.getByText(/^0\s+pending review$/)).toBeTruthy();
    // The row's badge and the filter tab.
    expect(screen.getAllByText("Withdrawn").length).toBeGreaterThan(1);
  });
});
