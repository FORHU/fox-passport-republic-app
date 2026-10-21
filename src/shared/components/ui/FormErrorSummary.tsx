"use client";

import { CircleAlert } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface FormErrorSummaryItem {
  /** What to do, phrased as an action: "Add a cover photo". */
  message: string;
  /** The `id` of the input to focus when the item is clicked. */
  fieldId?: string;
  /** Instead of `fieldId`, e.g. to switch to the step that holds the field. */
  onClick?: () => void;
}

/**
 * "3 things to fix before you can publish": the list shown at the top of a
 * form after a failed submit, each item jumping to its field. Pair it with a
 * `FieldError` under each of those fields.
 */
export function FormErrorSummary({
  title,
  items,
  className,
}: {
  title: string;
  items: FormErrorSummaryItem[];
  className?: string;
}) {
  if (items.length === 0) return null;

  const go = (item: FormErrorSummaryItem) => {
    if (item.onClick) return item.onClick();
    if (!item.fieldId) return;
    const el = document.getElementById(item.fieldId);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus({ preventScroll: true });
  };

  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border border-red-500/30 bg-red-500/6 p-4",
        className,
      )}
    >
      <p className="flex items-center gap-2 text-sm font-bold text-white">
        <CircleAlert
          aria-hidden
          strokeWidth={2}
          className="size-4.5 shrink-0 text-red-400"
        />
        {title}
      </p>
      <ul className="mt-3 space-y-2 pl-[26px]">
        {items.map((item) => (
          <li key={item.fieldId ?? item.message}>
            <button
              type="button"
              onClick={() => go(item)}
              className="text-left text-sm text-red-400 underline-offset-4 transition-colors hover:text-red-300 hover:underline"
            >
              {item.message} <span aria-hidden>→</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FormErrorSummary;
