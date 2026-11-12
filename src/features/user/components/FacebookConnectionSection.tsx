"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { InlineAlert } from "@/shared/components/ui/InlineAlert";
import { useConfirm } from "@/shared/components/ui/ConfirmDialog";
import { FacebookIcon } from "@/shared/components/ui/FacebookIcon";
import { getApiErrorMessage } from "@/shared/lib/apiError";
import {
  disconnectFacebook,
  getFacebookConnectUrl,
  getFacebookConnection,
  getFacebookPages,
  selectFacebookPage,
  type FacebookConnection,
} from "@/shared/api/facebook";

const CONNECTION_KEY = ["facebookConnection"];
const PAGES_KEY = ["facebookPages"];

/** What the API's redirect back from Meta reports in `?facebook_error=`. */
export const CALLBACK_ERRORS: Record<string, string> = {
  invalid_state: "That Facebook link expired. Try connecting again.",
  cancelled: "Facebook wasn't connected.",
  permissions_declined:
    "FoxPassport needs permission to see and post to your Pages. Connect again and keep every permission on.",
  not_configured: "Sharing to Facebook isn't available right now.",
  connect_failed: "Couldn't connect Facebook. Try again.",
};

/**
 * Reads the outcome Meta's redirect left in the URL once, tells the Foxer, and
 * takes it out of the address so a reload doesn't repeat it.
 */
function useCallbackOutcome() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const ok = url.searchParams.get("facebook");
    const error = url.searchParams.get("facebook_error");
    if (!ok && !error) return;
    if (ok === "connected") toast.success("Facebook connected.");
    if (error) {
      toast.error(CALLBACK_ERRORS[error] ?? CALLBACK_ERRORS.connect_failed);
    }
    url.searchParams.delete("facebook");
    url.searchParams.delete("facebook_error");
    window.history.replaceState(window.history.state, "", url.toString());
  }, []);
}

/**
 * Settings → Connections: connect a Facebook account, choose the Page videos
 * are shared to, and disconnect. Nothing is posted from here; posting happens
 * only from the Facebook button on one of the Foxer's own videos.
 */
export default function FacebookConnectionSection() {
  useCallbackOutcome();
  const queryClient = useQueryClient();
  const { confirm, dialog } = useConfirm();
  const [choosingPage, setChoosingPage] = useState(false);

  const connection = useQuery({
    queryKey: CONNECTION_KEY,
    queryFn: getFacebookConnection,
    staleTime: 0,
  });
  const data = connection.data;
  const active = Boolean(data?.connected && data.status === "active");
  const showPicker = active && (!data?.page || choosingPage);

  const pages = useQuery({
    queryKey: PAGES_KEY,
    queryFn: getFacebookPages,
    enabled: showPicker,
    staleTime: 0,
  });

  const connect = useMutation({
    mutationFn: getFacebookConnectUrl,
    onSuccess: (url) => window.location.assign(url),
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Couldn't start connecting Facebook. Try again.")),
  });

  const select = useMutation({
    mutationFn: selectFacebookPage,
    onSuccess: (updated: FacebookConnection) => {
      queryClient.setQueryData(CONNECTION_KEY, updated);
      setChoosingPage(false);
      toast.success(
        updated.page?.name
          ? `Videos will be shared to ${updated.page.name}.`
          : "Page saved.",
      );
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Couldn't save that Page. Try again.")),
  });

  const disconnect = useMutation({
    mutationFn: disconnectFacebook,
    onSuccess: (updated: FacebookConnection) => {
      queryClient.setQueryData(CONNECTION_KEY, updated);
      queryClient.removeQueries({ queryKey: PAGES_KEY });
      setChoosingPage(false);
      toast.success("Facebook disconnected.");
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Couldn't disconnect Facebook. Try again.")),
  });

  const confirmDisconnect = async () => {
    const ok = await confirm({
      title: "Disconnect Facebook?",
      description:
        "You won't be able to share videos to your Page until you connect again. Videos already on Facebook stay there.",
      confirmLabel: "Disconnect",
      tone: "danger",
    });
    if (ok) disconnect.mutate();
  };

  return (
    <div className="bg-surface border border-white/5 rounded-[2rem] p-5 sm:p-8 space-y-6">
      <div>
        <h2 className="text-lg font-display font-bold mb-1">Connections</h2>
        <p className="text-sm text-white/40">
          Share your FoxPassport videos to a Facebook Page you manage.
          FoxPassport posts only when you press Facebook on one of your videos.
        </p>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
            <FacebookIcon brand className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">Facebook Page</p>
            <p className="text-xs text-white/40 truncate">
              {connection.isLoading
                ? "Checking…"
                : !data?.available
                  ? "Not available yet"
                  : !data.connected
                    ? "Not connected"
                    : data.status === "needs_reconnect"
                      ? "Needs reconnecting"
                      : data.facebookUserName
                        ? `Connected as ${data.facebookUserName}`
                        : "Connected"}
            </p>
          </div>
        </div>

        {connection.isError ? (
          <InlineAlert tone="error">
            Couldn&apos;t load your Facebook connection.{" "}
            <button
              type="button"
              className="underline"
              onClick={() => connection.refetch()}
            >
              Try again
            </button>
          </InlineAlert>
        ) : connection.isLoading ? null : !data?.available ? (
          <InlineAlert tone="info">
            Sharing to Facebook isn&apos;t available yet.
          </InlineAlert>
        ) : !data.connected ? (
          <Button
            variant="accent"
            onClick={() => connect.mutate()}
            disabled={connect.isPending}
          >
            {connect.isPending ? "Opening Facebook…" : "Connect Facebook"}
          </Button>
        ) : data.status === "needs_reconnect" ? (
          <div className="space-y-3">
            <InlineAlert tone="warning">
              Your Facebook connection has expired. Reconnect to keep sharing
              videos.
            </InlineAlert>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="accent"
                onClick={() => connect.mutate()}
                disabled={connect.isPending}
              >
                {connect.isPending ? "Opening Facebook…" : "Reconnect"}
              </Button>
              <Button
                variant="ghost"
                onClick={confirmDisconnect}
                disabled={disconnect.isPending}
              >
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {data.page && !choosingPage ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-white/70">
                  Sharing to{" "}
                  <span className="font-bold text-white">
                    {data.page.name ?? "your Page"}
                  </span>
                </p>
                <Button variant="outline" size="sm" onClick={() => setChoosingPage(true)}>
                  Change Page
                </Button>
              </div>
            ) : (
              <PagePicker
                pages={pages.data}
                isLoading={pages.isLoading}
                isError={pages.isError}
                onRetry={() => pages.refetch()}
                selectedId={data.page?.id}
                saving={select.isPending ? select.variables : undefined}
                onSelect={(id) => select.mutate(id)}
                onCancel={data.page ? () => setChoosingPage(false) : undefined}
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={confirmDisconnect}
              disabled={disconnect.isPending}
            >
              {disconnect.isPending ? "Disconnecting…" : "Disconnect Facebook"}
            </Button>
          </div>
        )}
      </div>
      {dialog}
    </div>
  );
}

function PagePicker({
  pages,
  isLoading,
  isError,
  onRetry,
  selectedId,
  saving,
  onSelect,
  onCancel,
}: {
  pages?: { id: string; name: string; canPublish: boolean }[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  selectedId?: string;
  saving?: string;
  onSelect: (id: string) => void;
  onCancel?: () => void;
}) {
  if (isLoading) return <p className="text-sm text-white/30">Loading your Pages…</p>;
  if (isError) {
    return (
      <InlineAlert tone="error">
        Couldn&apos;t load your Facebook Pages.{" "}
        <button type="button" className="underline" onClick={onRetry}>
          Try again
        </button>
      </InlineAlert>
    );
  }
  if (!pages?.length) {
    return (
      <InlineAlert tone="info">
        You don&apos;t manage any Facebook Pages. Facebook only lets apps post
        to Pages, not personal profiles.{" "}
        <a
          href="https://www.facebook.com/pages/create"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Create a Page
        </a>
        , then connect again.
      </InlineAlert>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-sm text-white/70">Choose the Page to share videos to:</p>
      <ul className="space-y-2">
        {pages.map((page) => (
          <li key={page.id}>
            <button
              type="button"
              disabled={!page.canPublish || Boolean(saving)}
              onClick={() => onSelect(page.id)}
              className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-colors disabled:cursor-not-allowed ${
                page.id === selectedId
                  ? "border-accent/40 bg-accent/10"
                  : "border-white/5 bg-white/[0.02] hover:bg-white/5"
              } ${page.canPublish ? "" : "opacity-50"}`}
            >
              <span className="text-sm font-bold text-white truncate">{page.name}</span>
              <span className="text-xs text-white/40 shrink-0">
                {saving === page.id
                  ? "Saving…"
                  : !page.canPublish
                    ? "You can't post here"
                    : page.id === selectedId
                      ? "Current"
                      : "Choose"}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {onCancel && (
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </div>
  );
}
