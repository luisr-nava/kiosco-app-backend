"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { DateRangePicker, type DateRangeValue } from "@/components/ui/date-range-picker";
import type { PeriodFilter } from "../types/cash-register-report";

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

function ReportsFilters({
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
    (month) => period !== "month" || month.value <= (monthYearValue === currentYear ? currentMonth : 12),
  );

  const yearOptions = buildYears(minYear, currentYear);

  return (
    <Card className="rounded-3xl border border-border shadow-sm">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-semibold">Filtrar período</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-[240px_1fr]">
          <div className="space-y-2">
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
          {period === "day" && (
            <div className="space-y-2">
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
          {period === "week" && (
            <div className="space-y-2">
              <Label>Semana</Label>
              <DateRangePicker
                value={weekRangeValue}
                onChange={onWeekRangeChange}
                disabled={isLoading}
                maxDate={new Date()}
              />
            </div>
          )}
          {period === "month" && (
            <div className="grid gap-2 sm:grid-cols-2">
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
          {period === "year" && (
            <div className="space-y-2">
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
      </CardContent>
    </Card>
  );
}

export { ReportsFilters };
