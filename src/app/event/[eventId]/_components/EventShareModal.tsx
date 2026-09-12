"use client";

import React, { useState } from "react";
import QRCode from "react-qr-code";
import { trackPostShare } from "@/shared/api/feed";
import { toast } from "sonner";

interface EventShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  feedPostId?: string | null;
}

export function EventShareModal({
  isOpen,
  onClose,
  eventId,
  eventName,
  feedPostId,
}: EventShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/event/${eventId}`
      : `/event/${eventId}`;

  const handleShareTracking = () => {
    if (feedPostId) {
      trackPostShare(feedPostId).catch(() => {});
    }
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success("Link copied to clipboard!");
      handleShareTracking();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: eventName,
          text: `Check out ${eventName} on FoxPassport!`,
          url: shareUrl,
        });
        handleShareTracking();
      } catch (err: any) {
        if (err.name !== "AbortError") {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#121218]/95 p-6 shadow-2xl backdrop-blur-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-accent text-[22px]">
            share
          </span>
          <h2 className="text-xl font-display font-bold text-white">
            Share Experience
          </h2>
        </div>
        <p className="text-sm text-text-muted mb-6">
          Share <span className="text-white font-medium">{eventName}</span> with
          friends, family, or your community.
        </p>

        {/* QR Code view toggle */}
        {showQr ? (
          <div className="flex flex-col items-center gap-4 py-4 animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-white rounded-2xl shadow-xl">
              <QRCode
                value={shareUrl}
                size={180}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <p className="text-xs text-white/50 text-center">
              Scan with camera or QR reader to view listing
            </p>
            <button
              onClick={() => setShowQr(false)}
              className="mt-2 text-xs font-bold text-accent hover:underline cursor-pointer"
            >
              ← Back to share options
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-accent text-black font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-accent/20"
              >
                <span className="material-symbols-outlined text-[18px]">
                  ios_share
                </span>
                Share Via...
              </button>

              <button
                onClick={() => setShowQr(true)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  qr_code_2
                </span>
                QR Code
              </button>
            </div>

            {/* Copy Link input box */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <label className="text-xs font-semibold text-white/60 mb-1.5 block">
                Direct Link
              </label>
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-transparent px-3 text-xs text-white/80 select-all outline-none truncate"
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    copied
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copied ? "check" : "content_copy"}
                  </span>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
