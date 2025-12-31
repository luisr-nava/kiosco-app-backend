"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { cashRegisterApi } from "@/lib/api/cash-register.api";
import {
  CashRegisterReportsQueryParams,
  UseCashRegisterReportsResult,
} from "../type";
import { getReportsAction } from "../actions/get-reports";

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
      "reports",
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
      getReportsAction({
        period,
        date,
        dateFrom,
        dateTo,
        month,
        year,
      }),
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

