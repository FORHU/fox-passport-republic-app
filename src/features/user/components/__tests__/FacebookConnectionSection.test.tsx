import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { FacebookConnection } from "@/shared/api/facebook";
import FacebookConnectionSection from "../FacebookConnectionSection";

/** Settings → Connections: each state the Facebook connection can be in, and
 * what the Foxer can do from it. */

const api = vi.hoisted(() => ({
  getFacebookConnection: vi.fn(),
  getFacebookConnectUrl: vi.fn(),
  getFacebookPages: vi.fn(),
  selectFacebookPage: vi.fn(),
  disconnectFacebook: vi.fn(),
}));
vi.mock("@/shared/api/facebook", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/api/facebook")>()),
  ...api,
}));

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

const connection = (over: Partial<FacebookConnection> = {}): FacebookConnection => ({
  available: true,
  connected: false,
  status: null,
  facebookUserName: null,
  page: null,
  userTokenExpiresAt: null,
  ...over,
});

const renderSection = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <FacebookConnectionSection />
    </QueryClientProvider>,
  );

beforeEach(() => {
  for (const fn of Object.values(api)) fn.mockReset();
  toast.success.mockReset();
  toast.error.mockReset();
  window.history.replaceState(null, "", "/user/settings?section=connections");
});

describe("FacebookConnectionSection", () => {
  it("offers Connect when Facebook isn't connected", async () => {
    api.getFacebookConnection.mockResolvedValue(connection());
    api.getFacebookConnectUrl.mockResolvedValue(
      "https://www.facebook.com/v26.0/dialog/oauth?state=abc",
    );
    renderSection();
    expect(await screen.findByText("Not connected")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Connect Facebook" }));
    await waitFor(() => expect(api.getFacebookConnectUrl).toHaveBeenCalled());
  });

  it("explains when the feature is switched off on the server", async () => {
    api.getFacebookConnection.mockResolvedValue(connection({ available: false }));
    renderSection();
    expect(
      await screen.findByText("Sharing to Facebook isn't available yet."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Connect Facebook" })).toBeNull();
  });

  it("lists the Foxer's Pages and saves the one they choose", async () => {
    api.getFacebookConnection.mockResolvedValue(
      connection({ connected: true, status: "active", facebookUserName: "Ada" }),
    );
    api.getFacebookPages.mockResolvedValue([
      { id: "111", name: "Fox Test Page", canPublish: true },
      { id: "222", name: "Read Only Page", canPublish: false },
    ]);
    api.selectFacebookPage.mockResolvedValue(
      connection({
        connected: true,
        status: "active",
        facebookUserName: "Ada",
        page: { id: "111", name: "Fox Test Page" },
      }),
    );
    renderSection();

    expect(await screen.findByText("Connected as Ada")).toBeInTheDocument();
    const readOnly = await screen.findByRole("button", { name: /Read Only Page/ });
    expect(readOnly).toBeDisabled();
    expect(readOnly).toHaveTextContent("You can't post here");

    fireEvent.click(screen.getByRole("button", { name: /Fox Test Page/ }));
    await waitFor(() =>
      expect(api.selectFacebookPage.mock.calls[0][0]).toBe("111"),
    );
    expect(await screen.findByText("Fox Test Page")).toBeInTheDocument();
    expect(screen.getByText(/Sharing to/)).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith(
      "Videos will be shared to Fox Test Page.",
    );
  });

  it("says so when the Foxer manages no Pages", async () => {
    api.getFacebookConnection.mockResolvedValue(
      connection({ connected: true, status: "active" }),
    );
    api.getFacebookPages.mockResolvedValue([]);
    renderSection();
    expect(
      await screen.findByText(/You don't manage any Facebook Pages/),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create a Page" })).toHaveAttribute(
      "href",
      "https://www.facebook.com/pages/create",
    );
  });

  it("asks to reconnect an expired connection", async () => {
    api.getFacebookConnection.mockResolvedValue(
      connection({
        connected: true,
        status: "needs_reconnect",
        page: { id: "111", name: "Fox Test Page" },
      }),
    );
    renderSection();
    expect(
      await screen.findByText(/Your Facebook connection has expired/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reconnect" })).toBeInTheDocument();
    expect(api.getFacebookPages).not.toHaveBeenCalled();
  });

  it("disconnects after the Foxer confirms", async () => {
    api.getFacebookConnection.mockResolvedValue(
      connection({
        connected: true,
        status: "active",
        page: { id: "111", name: "Fox Test Page" },
      }),
    );
    api.disconnectFacebook.mockResolvedValue(connection());
    renderSection();
    fireEvent.click(
      await screen.findByRole("button", { name: "Disconnect Facebook" }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "Disconnect" }));
    await waitFor(() => expect(api.disconnectFacebook).toHaveBeenCalled());
    expect(await screen.findByText("Not connected")).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith("Facebook disconnected.");
  });

  it("reports what happened on Meta's page, once", async () => {
    window.history.replaceState(
      null,
      "",
      "/user/settings?section=connections&facebook_error=permissions_declined",
    );
    api.getFacebookConnection.mockResolvedValue(connection());
    renderSection();
    await screen.findByText("Not connected");
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("needs permission to see and post to your Pages"),
    );
    expect(window.location.search).toBe("?section=connections");
  });
});
