"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

function formatDisplayDate(date?: Date) {
  if (!date) return "Seleccionar fecha";
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type DatePickerProps = {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  maxDate?: Date;
};

function DatePicker({
  value,
  onChange,
  disabled = false,
  required = false,
  className,
  maxDate,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn("w-full justify-between", className)}
          variant="outline"
          disabled={disabled}
          aria-label="Seleccionar fecha"
          aria-required={required}
        >
          <span>{formatDisplayDate(value)}</span>
          <CalendarIcon className="h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" sideOffset={8} align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => onChange?.(date ?? undefined)}
          className="w-[18rem]"
          showOutsideDays
          disabled={maxDate ? { after: maxDate } : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
