"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverPrimitive.PopoverContentProps
>(({ className, align = "start", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "border-border bg-popover text-popover-foreground focus-visible:ring-ring focus-visible:ring-offset-background z-50 w-72 rounded-2xl border px-2 py-2 shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = "PopoverContent";

const PopoverArrow = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Arrow>,
  PopoverPrimitive.PopoverArrowProps
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Arrow ref={ref} className={cn("fill-popover", className)} {...props} />
));
PopoverArrow.displayName = "PopoverArrow";

export { Popover, PopoverTrigger, PopoverContent, PopoverArrow };
