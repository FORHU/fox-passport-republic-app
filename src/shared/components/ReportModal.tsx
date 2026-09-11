"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { toast } from "sonner";
import { fileReport } from "@/shared/api/feed";

const REASONS = [
  "Spam",
  "Harassment or bullying",
  "Hate speech",
  "Nudity or sexual content",
  "Violence or dangerous content",
  "Misinformation",
  "Something else",
];

interface ReportModalProps {
  targetType: "post" | "user";
  targetId: string;
  onClose: () => void;
}

export function ReportModal({
  targetType,
  targetId,
  onClose,
}: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

  const handleSubmit = async () => {
    if (!reason || submitting) return;
    setSubmitting(true);
    try {
      await fileReport({
        targetType,
        targetId,
        reason,
        details: details.trim(),
      });
      toast.success("Report submitted — our team will review it.");
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Could not submit this report.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3">
          <h2 className="text-sm font-bold text-white">
            Report {targetType === "post" ? "Post" : "Account"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-1">
          <p className="text-xs text-zinc-500 mb-2">
            Why are you reporting this {targetType}?
          </p>
          {REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                reason === r
                  ? "bg-lime-400 text-black"
                  : "text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              {r}
            </button>
          ))}
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Additional details (optional)"
            rows={3}
            className="mt-2 w-full resize-none bg-zinc-900 border border-zinc-800 focus:border-lime-400/60 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="border-t border-zinc-800/80 p-3">
          <button
            onClick={handleSubmit}
            disabled={!reason || submitting}
            className="w-full h-10 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {submitting ? "Submitting…" : "Submit Report"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
