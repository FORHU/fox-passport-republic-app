import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  iconPosition?: "left" | "right";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, iconPosition = "left", ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative group">
          {iconPosition === "left" && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-accent transition-colors">
              <span className="material-symbols-outlined">{icon}</span>
            </div>
          )}
          <input
            type={type}
            className={cn(
              "block w-full bg-transparent border-none text-white placeholder-white/40 focus:ring-0 font-medium focus:placeholder-white/20 transition-all outline-none",
              iconPosition === "left" ? "pl-12 pr-4" : "pl-4 pr-12",
              "py-4 text-base",
              className
            )}
            ref={ref}
            {...props}
          />
          {iconPosition === "right" && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-accent transition-colors">
              <span className="material-symbols-outlined">{icon}</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          "block w-full px-4 py-4 bg-transparent border-none text-white placeholder-white/40 focus:ring-0 font-medium focus:placeholder-white/20 transition-all outline-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
