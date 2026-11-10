import * as React from "react";
import { cn } from "@/shared/lib/utils";

/**
 * One placeholder block in the shape of the content that is loading. Size it
 * with classes (`h-4 w-32`, `h-12 w-12 rounded-full`). The pulse stops under
 * `prefers-reduced-motion`. Hidden from screen readers: wrap a set of them in
 * `SkeletonGroup`, which announces the loading state once.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded bg-white/6 motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

interface SkeletonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** What is loading, read by screen readers ("Loading bookings"). */
  label: string;
}

/** Wraps skeleton blocks and tells assistive tech, once, that content is loading. */
export function SkeletonGroup({
  label,
  className,
  children,
  ...props
}: SkeletonGroupProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

interface SkeletonRowsProps {
  label: string;
  /** How many rows to draw. */
  rows?: number;
  /** Draw a round avatar at the start of each row. */
  avatar?: boolean;
  className?: string;
}

/** A list of rows: an optional avatar and two text lines each. */
export function SkeletonRows({
  label,
  rows = 3,
  avatar = false,
  className,
}: SkeletonRowsProps) {
  return (
    <SkeletonGroup label={label} className={cn("space-y-4", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          {avatar && <Skeleton className="h-10 w-10 shrink-0 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}
