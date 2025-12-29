"use client";

import { useState } from "react";

import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnalyticsResponse } from "../../interfaces";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectItem } from "@radix-ui/react-select";

interface AnalyticsProps {
  analytics: AnalyticsResponse;
  analyticsLoading: boolean;
}

const PERIOD_OPTIONS = [
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
  { value: "week", label: "Semana" },
];

export const Analytics = ({ analytics, analyticsLoading }: AnalyticsProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState(PERIOD_OPTIONS[0].value);

  if (analyticsLoading) return <div>Loading analytics...</div>;
  if (!analytics) return <div>No analytics data available.</div>;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base font-semibold">Seleccionar período de análisis</CardTitle>
            <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
              <span className="font-semibold text-foreground">
                {/* {primaryLabel}: {formatCurrency(primaryTotal ?? 0)} */}
              </span>
              <span className="font-semibold text-foreground">
                {/* {secondaryLabel}: {formatCurrency(secondaryTotal ?? 0)} */}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.35em] text-muted-foreground sm:max-w-[60%]">
              <span className="font-semibold text-foreground">
                {/* Estadísticas adicionales aquí */}
              </span>
            </div>
            <div className="w-full max-w-[200px]">
              <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground">Período</p>
              <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value)} >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent align="end" className="w-[200px]">
                  {PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 py-2">
        <div className="relative w-full min-w-0 h-[230px]">
          {/* <Bar data={chartData} options={chartOptions} /> */}
          {/* {!hasData && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
              Sin datos disponibles.
            </div>
          )} */}
        </div>
      </CardContent>
    </Card>
  );
};
