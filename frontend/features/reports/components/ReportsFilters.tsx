"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { DateRangePicker, type DateRangeValue } from "@/components/ui/date-range-picker";
import { PeriodFilter } from "../type";

const periodOptions: Array<{ value: PeriodFilter; label: string }> = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
];

const MONTHS = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

interface ReportsFiltersProps {
  period: PeriodFilter;
  onPeriodChange: (period: PeriodFilter) => void;
  dayValue?: Date;
  onDayChange: (date: Date | undefined) => void;
  weekRangeValue: DateRangeValue;
  onWeekRangeChange: (range: DateRangeValue) => void;
  monthValue: number;
  onMonthChange: (month: number) => void;
  monthYearValue: number;
  onMonthYearChange: (year: number) => void;
  yearValue: number;
  onYearChange: (year: number) => void;
  currentYear: number;
  currentMonth: number;
  minYear: number;
  isLoading?: boolean;
}

const buildYears = (minYear: number, maxYear: number) => {
  const years: number[] = [];
  for (let year = maxYear; year >= minYear; year -= 1) {
    years.push(year);
  }
  return years;
};

export default function ReportsFilters({
  period,
  onPeriodChange,
  dayValue,
  onDayChange,
  weekRangeValue,
  onWeekRangeChange,
  monthValue,
  onMonthChange,
  monthYearValue,
  onMonthYearChange,
  yearValue,
  onYearChange,
  currentYear,
  currentMonth,
  minYear,
  isLoading = false,
}: ReportsFiltersProps) {
  const monthOptions = MONTHS.filter(
    (month) =>
      period !== "month" || month.value <= (monthYearValue === currentYear ? currentMonth : 12)
  );

  const yearOptions = buildYears(minYear, currentYear);
  const hasWeekRange = Boolean(weekRangeValue?.from) && Boolean(weekRangeValue?.to);
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Label izquierda */}
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Label className="text-muted-foreground text-xl whitespace-nowrap">
              Filtrar período
            </Label>
          </div>
        </div>

        {/* Controles */}
        <div className="grid w-full gap-4 sm:w-auto sm:grid-cols-[250px_minmax(350px,1fr)]">
          {/* Período */}
          <div className="min-h-[72px] space-y-2">
            <Label>Período</Label>
            <Select
              value={period}
              onValueChange={(value) => onPeriodChange(value as PeriodFilter)}
              aria-label="Seleccionar período"
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un período" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Día */}
          {period === "day" && (
            <div className="min-h-[72px] space-y-2">
              <Label>
                Día <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                value={dayValue}
                onChange={onDayChange}
                disabled={isLoading}
                required
                maxDate={new Date()}
              />
            </div>
          )}

          {/* Semana */}
          {period === "week" && (
            <div className="min-h-[72px] space-y-2">
              <Label>Semana</Label>
              <DateRangePicker
                value={weekRangeValue}
                onChange={onWeekRangeChange}
                disabled={isLoading}
                maxDate={new Date()}
                hasRange
              />
            </div>
          )}

          {/* Mes */}
          {period === "month" && (
            <div className="grid min-h-[72px] gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Mes</Label>
                <Select
                  value={String(monthValue)}
                  onValueChange={(value) => onMonthChange(Number(value))}
                  aria-label="Seleccionar mes"
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((month) => (
                      <SelectItem key={month.value} value={String(month.value)}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Año</Label>
                <Select
                  value={String(monthYearValue)}
                  onValueChange={(value) => onMonthYearChange(Number(value))}
                  aria-label="Seleccionar año"
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Año" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Año */}
          {period === "year" && (
            <div className="min-h-[72px] space-y-2">
              <Label>Año</Label>
              <Select
                value={String(yearValue)}
                onValueChange={(value) => onYearChange(Number(value))}
                aria-label="Seleccionar año"
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
