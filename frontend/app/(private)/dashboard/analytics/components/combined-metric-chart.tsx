"use client";

import type { ChartData } from "chart.js";
import { Bar } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsPeriod, AnalyticsSeriesPoint } from "@/lib/types/analytics";
import { formatAnalyticsLabel } from "./utils/format-analytics-label";
import { useMemo } from "react";
import { createCombinedChartOptions } from "./charts/chart-config";
import "./charts/chart-registration";
import { resolveThemeColor } from "./charts/chart-utils";

type CombinedChartPoint = {
  name: string;
  rawLabel: string;
  primary: number;
  secondary: number;
};

const formatCurrency = (value: number) =>
  `$${Number(value ?? 0).toLocaleString("es-AR")}`;

const formatDataPoints = (
  primary: AnalyticsSeriesPoint[],
  secondary: AnalyticsSeriesPoint[],
  period: AnalyticsPeriod,
): CombinedChartPoint[] => {
  const length = Math.max(primary.length, secondary.length, 1);

  return Array.from({ length }, (_, index) => {
    const primaryPoint = primary[index];
    const secondaryPoint = secondary[index];
    const rawLabel = primaryPoint?.label ?? secondaryPoint?.label ?? String(index + 1);

    return {
      name: formatAnalyticsLabel(rawLabel, period),
      rawLabel,
      primary: primaryPoint?.value ?? 0,
      secondary: secondaryPoint?.value ?? 0,
    };
  });
};

interface CombinedMetricChartProps {
  title: string;
  period: AnalyticsPeriod;
  primaryLabel: string;
  secondaryLabel: string;
  primaryColor: string;
  secondaryColor: string;
  primaryData: AnalyticsSeriesPoint[];
  secondaryData: AnalyticsSeriesPoint[];
  primaryTotal?: number;
  secondaryTotal?: number;
}

export function CombinedMetricChart({
  title,
  period,
  primaryLabel,
  secondaryLabel,
  primaryColor,
  secondaryColor,
  primaryData,
  secondaryData,
  primaryTotal = 0,
  secondaryTotal = 0,
}: CombinedMetricChartProps) {
  const dataPoints = useMemo(
    () => formatDataPoints(primaryData, secondaryData, period),
    [primaryData, secondaryData, period],
  );

  const resolvedPrimaryColor = useMemo(() => resolveThemeColor(primaryColor), [primaryColor]);
  const resolvedSecondaryColor = useMemo(() => resolveThemeColor(secondaryColor), [secondaryColor]);

  const chartData = useMemo<ChartData<"bar", number[], string>>(() => {
    return {
      labels: dataPoints.map((point) => point.name),
      datasets: [
        {
          label: primaryLabel,
          data: dataPoints.map((point) => point.primary),
          backgroundColor: resolvedPrimaryColor,
          borderRadius: 6,
          barThickness: 14,
          maxBarThickness: 28,
          borderSkipped: false,
        },
        {
          label: secondaryLabel,
          data: dataPoints.map((point) => point.secondary),
          backgroundColor: resolvedSecondaryColor,
          borderRadius: 6,
          barThickness: 14,
          maxBarThickness: 28,
          borderSkipped: false,
        },
      ],
    };
  }, [dataPoints, primaryLabel, secondaryLabel, resolvedPrimaryColor, resolvedSecondaryColor]);

  const chartOptions = useMemo(() => createCombinedChartOptions(), []);
  const hasData = dataPoints.some((point) => point.primary > 0 || point.secondary > 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
            <span className="font-semibold text-foreground">
              {primaryLabel}: {formatCurrency(primaryTotal ?? 0)}
            </span>
            <span className="font-semibold text-foreground">
              {secondaryLabel}: {formatCurrency(secondaryTotal ?? 0)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 py-2">
        <div className="relative w-full min-w-0 h-[230px]">
          <Bar data={chartData} options={chartOptions} />
          {!hasData && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
              Sin datos disponibles.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
