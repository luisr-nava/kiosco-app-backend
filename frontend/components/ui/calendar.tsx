"use client";

import * as React from "react";
import { DayPicker as ReactDayPicker, type DayPickerProps } from "react-day-picker";

import { cn } from "@/lib/utils";

import "react-day-picker/dist/style.css";

const Calendar = React.forwardRef<HTMLDivElement, DayPickerProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "border-border bg-popover text-popover-foreground rounded-2xl border shadow-sm",
        className
      )}
    >
      <ReactDayPicker
        className="bg-popover text-popover-foreground w-full rounded-2xl"
        {...props}
      />
    </div>
  )
);

Calendar.displayName = "Calendar";

export { Calendar };
