"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ConfirmModalProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for destructive actions (leave, remove, delete,
   * block) — the default. Set false for a merely disruptive-but-reversible
   * confirmation that doesn't need to read as "dangerous". */
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  isPending?: boolean;
}

// A single reusable "are you sure?" gate for destructive/irreversible
// actions across the app (leave group, remove member, delete chat, delete
// message, block) — every caller just supplies the copy and the action
// itself, so the confirm/cancel/escape/backdrop-click behavior stays
// identical everywhere instead of each menu reinventing it.
export function ConfirmModal({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = true,
  onConfirm,
  onClose,
  isPending,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, isPending]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3">
          <h2 className="text-sm font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            disabled={isPending}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
        </div>

        <div className="border-t border-zinc-800/80 p-3 flex gap-2">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-1 h-10 rounded-xl text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer ${
              danger
                ? "bg-red-500 hover:bg-red-400 text-white"
                : "bg-lime-400 hover:bg-lime-300 text-black"
            }`}
          >
            {isPending ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
