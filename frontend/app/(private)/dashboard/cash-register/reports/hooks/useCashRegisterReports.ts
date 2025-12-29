"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { cashRegisterApi } from "@/lib/api/cash-register.api";
import type {
  CashRegisterReport,
  PeriodFilter,
} from "@/lib/types/cash-register-report";

export interface CashRegisterReportsQueryParams {
  period: PeriodFilter;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  month?: string;
  year?: string;
  enabled?: boolean;
}

interface UseCashRegisterReportsResult {
  reports: CashRegisterReport[];
  message?: string;
  isFetching: boolean;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

export function useCashRegisterReports({
  period,
  date,
  dateFrom,
  dateTo,
  month,
  year,
  enabled,
}: CashRegisterReportsQueryParams): UseCashRegisterReportsResult {
  const queryKey = useMemo(
    () => [
      "cash-register-reports",
      period,
      date ?? null,
      dateFrom ?? null,
      dateTo ?? null,
      month ?? null,
      year ?? null,
    ],
    [period, date, dateFrom, dateTo, month, year],
  );

  const isDayPeriod = period === "day";
  const shouldFetch = enabled !== false && (!isDayPeriod || Boolean(date));

  const query = useQuery({
    queryKey,
    queryFn: () =>
      cashRegisterApi.getReports({
        period,
        date,
        dateFrom,
        dateTo,
        month,
        year,
      }),
    keepPreviousData: true,
    staleTime: 1000 * 60,
    enabled: shouldFetch,
  });

  return {
    reports: query.data?.reports ?? [],
    message: query.data?.message,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
