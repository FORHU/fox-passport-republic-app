import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent, screen, act } from "@testing-library/react";
import type { FacebookShare } from "@/shared/api/facebook";
import { PostShareMenu } from "../PostShareMenu";
import { POLL_INTERVAL_MS } from "@/features/republic/hooks/useShareToFacebook";

/** Share on a post: Copy link for everyone; on the Foxer's own video post,
 * Share to Facebook Page — one click, one share, and the outcome said plainly
 * (live, failed with Retry, or what to fix first). */

const api = vi.hoisted(() => ({
  shareToFacebook: vi.fn(),
  getFacebookShare: vi.fn(),
}));
vi.mock("@/shared/api/facebook", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/api/facebook")>()),
  ...api,
}));

const toast = vi.hoisted(() =>
  Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
);
vi.mock("sonner", () => ({ toast }));

const share = (over: Partial<FacebookShare> = {}): FacebookShare => ({
  id: "s1",
  postId: "p1",
  pageId: "111",
  pageName: "Fox Test Page",
  status: "processing",
  permalinkUrl: null,
  errorCode: null,
  errorMessage: null,
  attempts: 1,
  canRetry: false,
  ...over,
});

/** An axios-style refusal from the API. */
const refusal = (status: number, code: string, data?: unknown) =>
  Object.assign(new Error("Request failed"), {
    response: { status, data: { success: false, message: "refused", code, data } },
  });

const onCopyLink = vi.fn();
const renderMenu = (canShareToFacebook = true) =>
  render(
    <PostShareMenu
      postId="p1"
      onCopyLink={onCopyLink}
      copied={false}
      canShareToFacebook={canShareToFacebook}
    />,
  );

const trigger = () =>
  screen.getByRole("button", { name: /^(share|sharing…|copied!)$/i });
const facebookItem = () => screen.getByRole("menuitem", { name: /facebook/i });

/** Opens the menu and returns the Facebook item. */
const openFacebookItem = () => {
  fireEvent.click(trigger());
  return facebookItem();
};

/** Opens the menu and picks Share to Facebook Page (or its Retry). */
const pressFacebook = async () => {
  const item = openFacebookItem();
  await act(async () => {
    fireEvent.click(item);
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  api.shareToFacebook.mockReset();
  api.getFacebookShare.mockReset();
  onCopyLink.mockReset();
  toast.mockReset();
  toast.success.mockReset();
  toast.error.mockReset();
  toast.info.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("PostShareMenu", () => {
  it("copies the link and closes the menu", () => {
    renderMenu();
    fireEvent.click(trigger());
    fireEvent.click(screen.getByRole("menuitem", { name: "Copy link" }));
    expect(onCopyLink).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("offers only Copy link when the post can't go to Facebook", () => {
    renderMenu(false);
    fireEvent.click(trigger());
    expect(screen.getAllByRole("menuitem")).toHaveLength(1);
    expect(screen.getByRole("menuitem", { name: "Copy link" })).toBeInTheDocument();
  });

  it("closes on Escape", () => {
    renderMenu();
    fireEvent.click(trigger());
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("shares, waits for Facebook, then offers the link to the post", async () => {
    api.shareToFacebook.mockResolvedValueOnce(share());
    api.getFacebookShare
      .mockResolvedValueOnce(share())
      .mockResolvedValueOnce(
        share({
          status: "published",
          permalinkUrl: "https://www.facebook.com/111/videos/v1/",
        }),
      );
    renderMenu();
    expect(openFacebookItem()).toHaveTextContent("Share to Facebook Page");

    await act(async () => {
      fireEvent.click(facebookItem());
    });
    expect(api.shareToFacebook).toHaveBeenCalledWith("p1");
    // The menu closed; the Share button keeps showing the share is running.
    expect(trigger()).toHaveTextContent("Sharing…");
    expect(openFacebookItem()).toHaveTextContent("Sharing to Facebook…");
    expect(facebookItem()).toBeDisabled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2);
    });
    expect(api.getFacebookShare).toHaveBeenCalledTimes(2);
    expect(trigger()).toHaveTextContent("Share");
    expect(facebookItem()).toHaveTextContent("Shared to Facebook");
    expect(toast.success).toHaveBeenCalledWith(
      "Shared to Fox Test Page on Facebook.",
      { action: expect.objectContaining({ label: "View on Facebook" }) },
    );
  });

  it("sends once however often it is pressed while sharing", async () => {
    api.shareToFacebook.mockReturnValueOnce(new Promise(() => {}));
    renderMenu();
    const item = openFacebookItem();
    await act(async () => {
      fireEvent.click(item);
      fireEvent.click(item);
      fireEvent.click(item);
    });
    expect(api.shareToFacebook).toHaveBeenCalledTimes(1);
  });

  it("says why a share failed and offers Retry", async () => {
    api.shareToFacebook
      .mockResolvedValueOnce(
        share({
          status: "failed",
          errorCode: "FACEBOOK_VIDEO_REJECTED",
          errorMessage: "Facebook didn't accept this video.",
          canRetry: true,
        }),
      )
      .mockResolvedValueOnce(share({ status: "published" }));
    renderMenu();

    await pressFacebook();
    expect(toast.error).toHaveBeenCalledWith("Facebook didn't accept this video.");
    expect(openFacebookItem()).toHaveAccessibleName("Retry sharing to Facebook");

    await act(async () => {
      fireEvent.click(facebookItem());
    });
    expect(api.shareToFacebook).toHaveBeenCalledTimes(2);
    expect(openFacebookItem()).toHaveTextContent("Shared to Facebook");
  });

  it.each([
    ["FACEBOOK_NOT_CONNECTED", "Connect"],
    ["FACEBOOK_PAGE_NOT_SELECTED", "Choose Page"],
    ["FACEBOOK_TOKEN_INVALID", "Reconnect"],
  ])("sends the Foxer to Settings when the API says %s", async (code, label) => {
    api.shareToFacebook.mockRejectedValueOnce(refusal(409, code));
    renderMenu();
    await pressFacebook();
    expect(toast).toHaveBeenCalledWith(expect.any(String), {
      action: expect.objectContaining({ label }),
    });
    expect(openFacebookItem()).toHaveTextContent("Share to Facebook Page");
    expect(facebookItem()).not.toBeDisabled();
  });

  it("shows a video already on the Page as shared, with its link", async () => {
    api.shareToFacebook.mockRejectedValueOnce(
      refusal(
        409,
        "ALREADY_SHARED",
        share({ status: "published", permalinkUrl: "https://www.facebook.com/x" }),
      ),
    );
    renderMenu();
    await pressFacebook();
    expect(openFacebookItem()).toHaveTextContent("Shared to Facebook");
    expect(toast.success).toHaveBeenCalledWith(
      "This video is already on your Facebook Page.",
      { action: expect.objectContaining({ label: "View on Facebook" }) },
    );
  });

  it("falls back to a plain message when Facebook or the API is down", async () => {
    api.shareToFacebook.mockRejectedValueOnce(refusal(503, "FACEBOOK_NOT_CONFIGURED"));
    renderMenu();
    await pressFacebook();
    expect(toast.error).toHaveBeenCalledWith(
      "Couldn't share to Facebook. Try again in a moment.",
    );
    expect(openFacebookItem()).toHaveTextContent("Share to Facebook Page");
  });
});
