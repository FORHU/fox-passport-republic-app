/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  useConversations,
  useAcceptConversationRequest,
  useDeclineConversationRequest,
} from "../hooks/useMessages";
import type { Conversation } from "../types";

interface MessageRequestsModalProps {
  onClose: () => void;
  /** Opens the given request in the chat panel (its Accept/Delete prompt —
   * see ChatPanel) instead of acting on it right here in the list. */
  onSelectRequest: (conversation: Conversation) => void;
}

const errorMessage = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? fallback;

// Its own "folder" — same overlay pattern as the app's other modals — so
// incoming requests don't surface inline anywhere until you deliberately
// come look for them here.
export function MessageRequestsModal({
  onClose,
  onSelectRequest,
}: MessageRequestsModalProps) {
  const { data: conversations = [] } = useConversations();
  const requests = conversations.filter((c) => c.isIncomingRequest);
  const acceptRequest = useAcceptConversationRequest();
  const declineRequest = useDeclineConversationRequest();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const handleAccept = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    acceptRequest.mutate(id, {
      onError: (err) =>
        toast.error(errorMessage(err, "Could not accept this request.")),
    });
  };

  const handleDecline = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    declineRequest.mutate(id, {
      onError: (err) =>
        toast.error(errorMessage(err, "Could not decline this request.")),
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-0 sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative min-h-screen w-full bg-zinc-950 sm:min-h-0 sm:max-h-[80vh] sm:w-full sm:max-w-md sm:overflow-y-auto sm:rounded-2xl sm:border sm:border-zinc-800 sm:shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/95 px-4 py-3 backdrop-blur sm:rounded-t-2xl sm:px-5">
          <h2 className="text-sm font-bold text-white">Message Requests</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="p-3 space-y-1.5">
          {requests.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-10">
              No pending message requests.
            </p>
          ) : (
            requests.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectRequest(c)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 transition-colors text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700/50 flex items-center justify-center text-xs font-bold text-zinc-500">
                  {c.otherUser?.imgId ? (
                    <img
                      src={c.otherUser.imgId}
                      alt={c.otherUser.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    c.otherUser?.name?.charAt(0)?.toUpperCase() || "?"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-200 truncate">
                    {c.otherUser?.name || "Unknown Citizen"}
                  </p>
                  <p className="text-[10px] text-zinc-500 truncate">
                    {c.lastMessage
                      ? c.lastMessage.content
                      : "Sent you a message request"}
                  </p>
                </div>
                <div
                  className="flex items-center gap-1.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => handleAccept(c.id, e)}
                    disabled={acceptRequest.isPending}
                    className="h-8 px-3 rounded-lg bg-lime-400 text-black text-xs font-black hover:bg-lime-300 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Accept
                  </button>
                  <button
                    onClick={(e) => handleDecline(c.id, e)}
                    disabled={declineRequest.isPending}
                    className="h-8 px-3 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-bold hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
