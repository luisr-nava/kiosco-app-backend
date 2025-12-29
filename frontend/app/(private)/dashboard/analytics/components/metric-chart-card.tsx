"use client";

import type { ChartData, ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsSeriesPoint } from "@/lib/types/analytics";
import { useMemo } from "react";
import { createMetricChartOptions } from "./charts/chart-config";
import "./charts/chart-registration";
import { resolveThemeColor } from "./charts/chart-utils";

type MetricChartData = ChartData<"bar", number[], string>;

interface MetricChartCardProps {
  title: string;
  description?: string;
  series: AnalyticsSeriesPoint[];
  color: string;
  total?: number;
}

export function MetricChartCard({
  title,
  description,
  series,
  color,
  total,
}: MetricChartCardProps) {
  const resolvedColor = useMemo(() => resolveThemeColor(color), [color]);
  const chartOptions = useMemo<ChartOptions<"bar">>(() => createMetricChartOptions(), []);

  const chartData = useMemo<MetricChartData>(() => {
    const labels = series.map((point) => point.label ?? "—");
    const values = series.map((point) => point.value ?? 0);

    return {
      labels,
      datasets: [
        {
          label: title,
          data: values,
          backgroundColor: resolvedColor,
          borderRadius: 6,
          barThickness: 24,
          maxBarThickness: 48,
          borderSkipped: false,
        },
      ],
    };
  }, [series, resolvedColor, title]);

  const hasData = chartData.datasets.some((dataset) =>
    dataset.data.some((value) => (typeof value === "number" ? value > 0 : false)),
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && (
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <p className="text-sm font-semibold text-foreground">
          ${Number(total ?? 0).toLocaleString("es-AR")}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative w-full min-w-0 h-[260px]">
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
