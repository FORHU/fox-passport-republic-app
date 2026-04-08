import * as React from "react";
import { cn } from "@/lib/utils";

export interface KPICardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon: string;
  iconColor?: string;
  trend?: {
    value: string;
    direction: "up" | "down";
    label?: string;
  };
  progressColor?: string;
  progressWidth?: string;
}

const KPICard = React.forwardRef<HTMLDivElement, KPICardProps>(
  (
    {
      className,
      title,
      value,
      icon,
      iconColor = "text-accent",
      trend,
      progressColor = "bg-accent",
      progressWidth = "70%",
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/5",
          className
        )}
        {...props}
      >
        {/* Background Icon */}
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className={cn("material-symbols-outlined text-6xl", iconColor)}>
            {icon}
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <p className="text-text-muted text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-display font-bold text-white mb-2">
            {value}
          </h3>

          {/* Trend Indicator */}
          {trend && (
            <div className="flex items-center gap-2 text-xs">
              <span
                className={cn(
                  "px-2 py-1 rounded-lg font-bold flex items-center gap-1",
                  trend.direction === "up"
                    ? "bg-success/20 text-success"
                    : "bg-destructive/20 text-destructive"
                )}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {trend.direction === "up" ? "trending_up" : "trending_down"}
                </span>{" "}
                {trend.value}
              </span>
              {trend.label && (
                <span className="text-white/40">{trend.label}</span>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div
          className={cn(
            "absolute bottom-0 left-0 h-1 shadow-[0_0_10px_currentColor]",
            progressColor
          )}
          style={{ width: progressWidth }}
        />
      </div>
    );
  }
);
KPICard.displayName = "KPICard";

export { KPICard };
