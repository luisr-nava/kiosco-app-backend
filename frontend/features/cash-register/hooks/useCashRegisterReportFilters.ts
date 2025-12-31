import { useMemo, useState } from "react";
import type { DateRangeValue } from "@/components/ui/date-range-picker";
import { formatIsoDate } from "@/lib/date-utils";
import { CashRegisterReportsQueryParams, PeriodFilter } from "../type";

const DEFAULT_PERIOD: PeriodFilter = "day";

export function useCashRegisterReportFilters() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const [period, setPeriod] = useState<PeriodFilter>(DEFAULT_PERIOD);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(
    () => new Date(),
  );
  const [weekRange, setWeekRange] = useState<DateRangeValue>({});
  const [monthSelection, setMonthSelection] = useState({
    month: currentMonth,
    year: currentYear,
  });
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const normalizedRange = useMemo<DateRangeValue>(() => {
    const { from, to } = weekRange;
    if (from && to && from > to) {
      return { from: to, to: from };
    }
    return { from, to };
  }, [weekRange]);

  const queryParams = useMemo<CashRegisterReportsQueryParams>(() => {
    const params: CashRegisterReportsQueryParams = { period };

    if (period === "day" && selectedDay) {
      params.date = formatIsoDate(selectedDay);
    }

    if (period === "week") {
      if (normalizedRange.from) {
        params.dateFrom = formatIsoDate(normalizedRange.from);
      }
      if (normalizedRange.to) {
        params.dateTo = formatIsoDate(normalizedRange.to);
      }
    }

    if (period === "month") {
      params.month = String(monthSelection.month).padStart(2, "0");
      params.year = String(monthSelection.year);
    }

    if (period === "year") {
      params.year = String(selectedYear);
    }

    return params;
  }, [period, selectedDay, normalizedRange, monthSelection, selectedYear]);

  return {
    queryParams,
    ui: {
      period,
      onPeriodChange: setPeriod,
      dayValue: selectedDay,
      onDayChange: setSelectedDay,
      weekRangeValue: normalizedRange,
      onWeekRangeChange: setWeekRange,
      monthValue: monthSelection.month,
      onMonthChange: (month: number) =>
        setMonthSelection((prev) => ({ ...prev, month })),
      monthYearValue: monthSelection.year,
      onMonthYearChange: (year: number) =>
        setMonthSelection((prev) => ({
          month:
            year === currentYear
              ? Math.min(prev.month, currentMonth)
              : prev.month,
          year,
        })),
      yearValue: selectedYear,
      onYearChange: setSelectedYear,
      currentYear,
      currentMonth,
    },
  };
}

