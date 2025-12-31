"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

function formatDisplayDate(date?: Date) {
  if (!date) return "-";
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type DateRangeValue = {
  from?: Date;
  to?: Date;
};

type DateRangePickerProps = {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  disabled?: boolean;
  maxDate?: Date;
  className?: string;
  hasRange?: boolean;
};

function DateRangePicker({
  value,
  onChange,
  disabled = false,
  maxDate,
  className,
}: DateRangePickerProps) {
  const hasRange = Boolean(value?.from && value?.to);

  const handleSelect = (selectedRange: DateRange | undefined) => {
    onChange({
      from: selectedRange?.from,
      to: selectedRange?.to,
    });
  };
  const calendarValue: DateRange | undefined = value.from
    ? { from: value.from, to: value.to }
    : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between",
            hasRange ? "items-center" : "items-start",
            className,
          )}
          disabled={disabled}
          aria-label="Seleccionar rango de fechas">
          {hasRange ? (
            <span className="text-sm font-medium text-foreground">
              {formatDisplayDate(value?.from)} – {formatDisplayDate(value?.to)}
            </span>
          ) : (
            <div className="flex w-full justify-between">
              <div className="flex flex-col items-start">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Desde
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {value?.from && formatDisplayDate(value?.from)}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Hasta
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {value?.from && formatDisplayDate(value?.to)}
                </span>
              </div>
            </div>
          )}
          <CalendarIcon className="ml-2 h-4 w-4 opacity-70 shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0" sideOffset={8} align="start">
        <Calendar
          mode="range"
          selected={calendarValue}
          onSelect={handleSelect}
          className="w-[18rem]"
          showOutsideDays
          disabled={maxDate ? { after: maxDate } : undefined}
          classNames={{
            // months: "flex flex-col gap-4",
            // month: "space-y-4",

            // caption: "flex justify-between items-center px-2",
            // caption_label: "text-sm font-medium text-foreground",

            // nav: "flex items-center gap-1",
            // nav_button:
            //   "h-7 w-7 bg-transparent hover:bg-muted rounded-md transition",
            // nav_button_previous: "",
            // nav_button_next: "",

            // table: "w-full border-collapse",
            // head_row: "",
            // head_cell:
            //   "w-9 text-xs font-medium text-muted-foreground text-center",

            // row: "",
            // cell: "relative h-9 w-9 p-0 text-center",
            // day: "w-9 h-9 rounded-full inline-flex items-center justify-center text-sm transition hover:bg-muted",
            // day_today: "border border-primary text-primary",

            // day_selected: "bg-primary text-primary-foreground hover:bg-primary",

            // day_outside: "text-muted-foreground opacity-40",
            // day_disabled: "text-muted-foreground opacity-30",

            // /* RANGE */
            // day_range_start: "bg-primary text-primary-foreground rounded-full",
            // day_range_end: "bg-primary text-primary-foreground rounded-full",
            // day_range_middle: "bg-primary text-foreground rounded-none",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DateRangePicker, type DateRangeValue };

