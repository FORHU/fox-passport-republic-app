"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  FACEBOOK_SETTINGS_PATH,
  facebookErrorCode,
  facebookErrorShare,
  getFacebookShare,
  shareToFacebook,
  type FacebookShare,
} from "@/shared/api/facebook";
import { getApiErrorMessage } from "@/shared/lib/apiError";

// Facebook usually finishes a short video in well under a minute.
export const POLL_INTERVAL_MS = 3000;
export const POLL_ATTEMPTS = 40;

export type FacebookShareState = "idle" | "sharing" | "shared" | "failed";

const openSettings = () => window.location.assign(FACEBOOK_SETTINGS_PATH);

const viewAction = (share: FacebookShare | null) =>
  share?.permalinkUrl
    ? {
        label: "View on Facebook",
        onClick: () =>
          window.open(share.permalinkUrl!, "_blank", "noopener,noreferrer"),
      }
    : undefined;

/** Refusals that the Foxer fixes in Settings, and what to tell them. */
const SETTINGS_FIXES: Record<string, { message: string; label: string }> = {
  FACEBOOK_NOT_CONNECTED: {
    message: "Connect your Facebook Page to share videos there.",
    label: "Connect",
  },
  FACEBOOK_PAGE_NOT_SELECTED: {
    message: "Choose the Facebook Page to share to.",
    label: "Choose Page",
  },
  FACEBOOK_TOKEN_INVALID: {
    message: "Your Facebook connection has expired. Reconnect to keep sharing.",
    label: "Reconnect",
  },
};

/**
 * Sends a post's own video and caption to the author's connected Facebook
 * Page, then follows it until Facebook has it live. Nothing is sent until
 * `share` is called. The outcome is told with toasts; `state` drives the UI.
 */
export function useShareToFacebook(postId: string) {
  const [state, setStateRaw] = useState<FacebookShareState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  // Set synchronously: calls that land before the re-render still see it,
  // so one press sends one request.
  const busy = useRef(false);
  const setState = (next: FacebookShareState) => {
    busy.current = next === "sharing";
    setStateRaw(next);
  };

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const finish = (share: FacebookShare) => {
    if (!mounted.current) return;
    if (share.status === "published") {
      setState("shared");
      toast.success(
        share.pageName
          ? `Shared to ${share.pageName} on Facebook.`
          : "Shared to Facebook.",
        { action: viewAction(share) },
      );
    } else {
      setState("failed");
      toast.error(share.errorMessage || "Couldn't share to Facebook. Try again.");
    }
  };

  // Facebook processes the video after it arrives; ask until it is live.
  const poll = (attempt = 0) => {
    timer.current = setTimeout(async () => {
      if (!mounted.current) return;
      try {
        const share = await getFacebookShare(postId);
        if (share && (share.status === "published" || share.status === "failed")) {
          finish(share);
          return;
        }
      } catch {
        // A failed check says nothing about the video; ask again.
      }
      if (attempt + 1 < POLL_ATTEMPTS) {
        poll(attempt + 1);
      } else if (mounted.current) {
        setState("shared");
        toast.info(
          "Facebook is still processing your video. It will appear on your Page shortly.",
        );
      }
    }, POLL_INTERVAL_MS);
  };

  const share = useCallback(async () => {
    // Sharing a shared post asks again, which answers with its Facebook link.
    if (busy.current) return;
    setState("sharing");
    try {
      const result = await shareToFacebook(postId);
      if (result.status === "published" || result.status === "failed") {
        finish(result);
      } else {
        poll();
      }
    } catch (error) {
      if (!mounted.current) return;
      const code = facebookErrorCode(error);
      const existing = facebookErrorShare(error);
      if (code === "ALREADY_SHARED") {
        setState("shared");
        toast.success("This video is already on your Facebook Page.", {
          action: viewAction(existing),
        });
        return;
      }
      if (code === "SHARE_IN_PROGRESS") {
        poll();
        return;
      }
      setState("idle");
      const fix = code ? SETTINGS_FIXES[code] : undefined;
      if (fix) {
        toast(fix.message, { action: { label: fix.label, onClick: openSettings } });
        return;
      }
      toast.error(
        getApiErrorMessage(error, "Couldn't share to Facebook. Try again in a moment."),
      );
    }
  }, [postId]);

  return { state, share };
}
