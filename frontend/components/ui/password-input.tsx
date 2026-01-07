"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isInvalid = props["aria-invalid"] === true || props["aria-invalid"] === "true";
    return (
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className={cn(
            "placeholder:text-muted-foreground flex h-9 w-full rounded-md border bg-transparent px-3 py-1 pr-10 text-base shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none md:text-sm",
            isInvalid
              ? "border-destructive focus-visible:ring-destructive"
              : "border-input focus-visible:ring-ring",
            className
          )}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
