import React from "react";

interface ServiceListingSummaryCardProps {
  name: string;
  category: string;
  imageUrl: string | null;
  rateLabel: string;
  /** Rows after Rate, e.g. duration, fees and the total. */
  children?: React.ReactNode;
  /** Below the rows, e.g. the booking button. */
  footer?: React.ReactNode;
}

/**
 * The summary card on the public service page. The Service Studio's preview
 * renders it too, so a creator sees the card customers will see.
 */
export function ServiceListingSummaryCard({
  name,
  category,
  imageUrl,
  rateLabel,
  children,
  footer,
}: ServiceListingSummaryCardProps) {
  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 shadow-glow">
      <div className="relative h-48">
        {imageUrl ? (
          <img
            alt={name}
            className="w-full h-full object-cover"
            src={imageUrl}
          />
        ) : (
          <div className="w-full h-full bg-surface-highlight/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-white/20 text-[64px]">
              build
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/50 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-orange-400 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {category}
            </span>
          </div>
          <h3 className="text-xl font-display font-bold text-white leading-tight">
            {name}
          </h3>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Rate</span>
          <span className="text-white font-medium">{rateLabel}</span>
        </div>
        {children}
      </div>

      {footer && <div className="px-6 pb-6">{footer}</div>}
    </div>
  );
}
