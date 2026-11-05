"use client";

import React, { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/shared/lib/utils";

export type CategoryNoticeMode = "create" | "update";

const COPY: Record<
  CategoryNoticeMode,
  { word: string; title: string; body: string[]; action: string }
> = {
  create: {
    word: "CREATE",
    title: "Category Creation Notice",
    body: [
      "Categories form part of the platform's permanent catalog and determine how events and listings are organized for every user. A new category may be created only after the proposal has been discussed with the relevant stakeholders, studied to confirm that it is necessary and does not duplicate or overlap an existing category, and formally approved.",
      "Please confirm that this category has completed that review. Note that its slug cannot be changed once it has been created.",
    ],
    action: "Confirm and create",
  },
  update: {
    word: "UPDATE",
    title: "Category Change Notice",
    body: [
      "Changes to a category take effect immediately across the platform and affect every event and listing that uses it. A change may be made only after it has been discussed with the relevant stakeholders and formally approved.",
      "Please confirm that the changes below have completed that review.",
    ],
    action: "Confirm and save",
  },
};

/**
 * The last step before a category is created or changed: a formal reminder
 * that categories are added or altered only after review and approval, and a
 * typed confirmation (CREATE / UPDATE) so the save is a deliberate act.
 *
 * Rendered above CategoryModal (`z-1000` over its `z-[999]`). Render it as a
 * sibling of the modal's overlay, not inside it: React events from a portal
 * bubble through the component tree and would reach the overlay's close.
 */
export function CategoryApprovalNotice({
  open,
  mode,
  summary,
  pending,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  mode: CategoryNoticeMode;
  summary: { label: string; value: string }[];
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const copy = COPY[mode];
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const matches = typed.trim() === copy.word;

  // A fresh confirmation every time the notice opens.
  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  const confirm = () => {
    if (matches && !pending) onConfirm();
  };

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next && !pending) onCancel();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-1000 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-1/2 top-1/2 z-1000 w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-surface-raised p-6 shadow-[0_10px_35px_rgba(0,0,0,0.25)] focus:outline-none"
        >
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
            <span aria-hidden className="material-symbols-outlined text-[22px]">
              gavel
            </span>
          </div>
          <DialogPrimitive.Title className="font-display text-lg font-bold text-white">
            {copy.title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description asChild>
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-white/60">
              {copy.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </DialogPrimitive.Description>

          {summary.length > 0 && (
            <dl className="mt-4 divide-y divide-white/5 rounded-xl border border-white/10 bg-white/5 text-xs">
              {summary.map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-4 px-4 py-2.5"
                >
                  <dt className="shrink-0 text-white/40">{row.label}</dt>
                  <dd className="break-all text-right font-semibold text-white">
                    {row.value || "—"}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-5 space-y-1.5">
            <label
              htmlFor="category-confirm-word"
              className="text-[10px] font-bold uppercase tracking-widest text-white/40"
            >
              Type {copy.word} to confirm
            </label>
            <input
              ref={inputRef}
              id="category-confirm-word"
              type="text"
              value={typed}
              disabled={pending}
              autoComplete="off"
              spellCheck={false}
              aria-describedby="category-confirm-hint"
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirm();
                }
              }}
              placeholder={copy.word}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder-white/15 outline-none transition-all focus:border-accent/40 disabled:opacity-50"
            />
            <p id="category-confirm-hint" className="text-[11px] text-white/30">
              Enter the word exactly as shown, in capital letters.
            </p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={pending}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={!matches || pending}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-black transition-all",
                "disabled:cursor-not-allowed disabled:opacity-40",
              )}
            >
              {pending && (
                <span
                  aria-hidden
                  className="material-symbols-outlined animate-spin text-[18px]"
                >
                  progress_activity
                </span>
              )}
              {copy.action}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
