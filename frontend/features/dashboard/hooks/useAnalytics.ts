import { useMemo, useState } from "react";
import { useAnalyticsQuery } from "./useAnalyticsQuery";
import { formatChartLabel, getHslColor, Period } from "@/utils";

export const useAnalytics = () => {
  const [period, setPeriod] = useState<Period>("week");
  const { analytics, analyticsLoading } = useAnalyticsQuery({
    period,
  });

  const PERIOD_OPTIONS: { value: Period; label: string }[] = [
    { value: "week", label: "Semana" },
    { value: "month", label: "Mes" },
    { value: "year", label: "Año" },
  ];

  const salesSeries = analytics?.metrics.sales.series ?? [];
  const purchasesSeries = analytics?.metrics.purchases.series ?? [];
  const incomesSeries = analytics?.metrics.incomes.series ?? [];
  const expensesSeries = analytics?.metrics.expenses.series ?? [];
  const topProducts = analytics?.insights.topProducts ?? [];
  const bestSales = analytics?.insights.bestSale ?? null;
  const hasAnyValue = useMemo(
    () =>
      [
        ...salesSeries,
        ...purchasesSeries,
        ...incomesSeries,
        ...expensesSeries,
      ].some((p) => p.value > 0),
    [salesSeries, purchasesSeries, incomesSeries, expensesSeries],
  );

  const salesVsPurchasesChart = useMemo(
    () => ({
      labels: salesSeries.map((p) => formatChartLabel(p.label, period)),
      datasets: [
        {
          label: "Ventas",
          data: salesSeries.map((p) => p.value),
          backgroundColor: getHslColor("--primary", 0.7),
          borderColor: getHslColor("--primary"),
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
          barThickness: 22,
          minBarLength: 0,
          maxBarLength: 10,
        },
        {
          label: "Compras",
          data: purchasesSeries.map((p) => p.value),
          backgroundColor: getHslColor("--secondary", 0.6),
          borderColor: getHslColor("--secondary", 1),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 22,
          minBarLength: 0,
          maxBarLength: 10,
        },
      ],
    }),
    [salesSeries, purchasesSeries, period],
  );
  const incomesVsExpensesChart = useMemo(() => {
    return {
      labels: incomesSeries.map((p) => formatChartLabel(p.label, period)),
      datasets: [
        {
          label: "Ingresos",
          data: incomesSeries.map((p) => p.value),
          backgroundColor: getHslColor("--secondary", 0.6),
          borderColor: getHslColor("--secondary", 1),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 22,
          minBarLength: 0,
          maxBarLength: 10,
        },
        {
          label: "Egresos",
          data: expensesSeries.map((p) => p.value),
          backgroundColor: getHslColor("--primary", 0.7),
          borderColor: getHslColor("--primary"),
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
          barThickness: 22,
          minBarLength: 0,
          maxBarLength: 10,
        },
      ],
    };
  }, [incomesSeries, expensesSeries]);

  return {
    hasAnyValue,
    period,
    setPeriod,
    PERIOD_OPTIONS,
    analyticsLoading,
    salesVsPurchasesChart,
    incomesVsExpensesChart,
    topProducts,
    bestSales,
  };
};

