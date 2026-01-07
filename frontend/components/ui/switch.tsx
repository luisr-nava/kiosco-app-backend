import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, onCheckedChange, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        onClick={() => {
          if (disabled) return;
          onCheckedChange?.(!checked);
        }}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors",
          checked ? "bg-primary" : "bg-muted",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "bg-background inline-block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";
