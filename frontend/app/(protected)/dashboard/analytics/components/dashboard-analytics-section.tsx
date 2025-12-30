"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";
import { AnalyticsPeriod, TopProduct } from "@/lib/types/analytics";
import { useAnalytics } from "../hooks/useAnalytics";
import { CombinedMetricChart } from "./combined-metric-chart";
import { useShopStore } from "@/features/shop/shop.store";

const PERIOD_OPTIONS: { label: string; value: AnalyticsPeriod }[] = [
  { label: "Semana", value: "week" },
  { label: "Mes", value: "month" },
  { label: "Año", value: "year" },
  { label: "Rango", value: "range" },
];

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  week: "Semana actual",
  month: "Mes actual",
  year: "Año actual",
  range: "Rango personalizado",
};

const formatCurrency = (value: number) =>
  `$${Number(value ?? 0).toLocaleString("es-AR")}`;

interface TopProductsCardProps {
  products?: TopProduct[];
}

function TopProductsCard({ products }: TopProductsCardProps) {
  const entries = (products ?? []).slice(0, 5);

  return (
    <Card className="space-y-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Top productos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 py-2">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin datos para mostrar.
          </p>
        ) : (
          entries.map((product, index) => (
            <div
              key={`${product.shopProductId ?? product.productId ?? index}`}
              className="flex items-center justify-between gap-3 border-b border-border/50 pb-2 last:border-b-0 last:pb-0">
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  #{index + 1} · {product.name || "Producto"}
                </p>
                <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
                  Unidades · {product.quantitySold ?? 0}
                </p>
              </div>
              <p className="text-right text-sm font-semibold text-foreground">
                {formatCurrency(product.totalAmount ?? 0)}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

interface BestSaleCardProps {
  bestSale?: {
    total?: number;
    date?: string;
    performedBy?: { fullName?: string | null; role?: string };
  };
  period: AnalyticsPeriod;
}

function BestSaleCard({ bestSale, period }: BestSaleCardProps) {
  if (!bestSale) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Mejor venta</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sin datos registrados.
          </p>
        </CardContent>
      </Card>
    );
  }

  const value = Number(bestSale.total ?? 0);
  const dateLabel = bestSale.date
    ? new Date(bestSale.date).toLocaleString("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  const performer = bestSale.performedBy;
  const roleLabel = performer?.role ?? "—";
  const displayName =
    performer?.fullName ?? (roleLabel === "OWNER" ? "Owner" : "-");

  return (
    <Card className="space-y-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Mejor venta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 py-2">
        <p className="text-foreground text-2xl font-semibold">
          {formatCurrency(value)}
        </p>
        <p className="text-sm text-muted-foreground">{dateLabel}</p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">{displayName}</p>
          <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">
            {roleLabel}
          </span>
        </div>
        <Separator className="my-2" />
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
          Período
        </p>
        <p className="text-sm font-semibold text-muted-foreground">
          {period.charAt(0).toUpperCase() + period.slice(1)}
        </p>
      </CardContent>
    </Card>
  );
}

function PeriodSelector({
  value,
  onChange,
}: {
  value: AnalyticsPeriod;
  onChange: (value: AnalyticsPeriod) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full border border-muted-foreground/20 bg-muted/10 p-1">
      {PERIOD_OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] transition ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function DashboardAnalyticsSection() {
  const { activeShopId } = useShopStore();
  const [uiPeriod, setUiPeriod] = useState<AnalyticsPeriod>("week");
  const [lastResolvedPeriod, setLastResolvedPeriod] =
    useState<AnalyticsPeriod>("week");
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);

  const isRangeSelection = uiPeriod === "range";
  const rangeReady = Boolean(from && to);
  const effectivePeriod =
    isRangeSelection && !rangeReady ? lastResolvedPeriod : uiPeriod;
  const periodLabel = PERIOD_LABELS[effectivePeriod];
  const showRangeWarning = isRangeSelection && !rangeReady;

  if (!activeShopId) {
    return null;
  }

  const formattedRangeFrom = from?.toISOString();
  const formattedRangeTo = to?.toISOString();
  const shouldRequestRange = isRangeSelection && rangeReady;

  const sharedQueryParams = {
    shopId: activeShopId,
    period: effectivePeriod,
    from: shouldRequestRange ? formattedRangeFrom : undefined,
    to: shouldRequestRange ? formattedRangeTo : undefined,
  };

  const salesQuery = useAnalytics({
    metric: "sales",
    ...sharedQueryParams,
  });
  const purchasesQuery = useAnalytics({
    metric: "purchases",
    ...sharedQueryParams,
  });
  const incomesQuery = useAnalytics({
    metric: "incomes",
    ...sharedQueryParams,
  });
  const expensesQuery = useAnalytics({
    metric: "expenses",
    ...sharedQueryParams,
  });

  useEffect(() => {
    const allQueriesMatch = [
      salesQuery,
      purchasesQuery,
      incomesQuery,
      expensesQuery,
    ].every(
      (query) => query.isSuccess && query.data?.period === effectivePeriod,
    );

    if (allQueriesMatch) {
      setLastResolvedPeriod(effectivePeriod);
    }
  }, [
    effectivePeriod,
    salesQuery.isSuccess,
    purchasesQuery.isSuccess,
    incomesQuery.isSuccess,
    expensesQuery.isSuccess,
    salesQuery.data?.period,
    purchasesQuery.data?.period,
    incomesQuery.data?.period,
    expensesQuery.data?.period,
  ]);

  const rangeInfo = salesQuery.data?.range;
  const rangeLabel =
    effectivePeriod === "range" && rangeInfo && rangeInfo.from && rangeInfo.to
      ? `${rangeInfo.from} → ${rangeInfo.to}`
      : "";

  const salesSeries = salesQuery.metricData?.series ?? [];
  const purchasesSeries = purchasesQuery.metricData?.series ?? [];
  const incomesSeries = incomesQuery.metricData?.series ?? [];
  const expensesSeries = expensesQuery.metricData?.series ?? [];

  const salesTotal = salesQuery.metricData?.total ?? 0;
  const purchasesTotal = purchasesQuery.metricData?.total ?? 0;
  const incomesTotal = incomesQuery.metricData?.total ?? 0;
  const expensesTotal = expensesQuery.metricData?.total ?? 0;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PeriodSelector value={uiPeriod} onChange={setUiPeriod} />
          {isRangeSelection && (
            <div className="flex flex-wrap gap-2">
              <label className="flex flex-col text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
                Desde
                <DatePicker
                  value={from ?? undefined}
                  onChange={(date) => setFrom(date ?? null)}
                  className="mt-1 min-w-48"
                  maxDate={to ?? undefined}
                />
              </label>
              <label className="flex flex-col text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
                Hasta
                <DatePicker
                  value={to ?? undefined}
                  onChange={(date) => setTo(date ?? null)}
                  className="mt-1 min-w-48"
                  maxDate={new Date()}
                />
              </label>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span>{periodLabel}</span>
          {rangeLabel && <span>{rangeLabel}</span>}
          {showRangeWarning && (
            <span className="text-destructive">
              Complete ambos campos para consultar el rango.
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CombinedMetricChart
          title="Ventas / Compras"
          period={effectivePeriod}
          primaryLabel="Ventas"
          secondaryLabel="Compras"
          primaryColor="hsl(var(--primary))"
          secondaryColor="hsl(var(--destructive))"
          primaryData={salesSeries}
          secondaryData={purchasesSeries}
          primaryTotal={salesTotal}
          secondaryTotal={purchasesTotal}
        />
        <CombinedMetricChart
          title="Ingresos / Egresos"
          period={effectivePeriod}
          primaryLabel="Ingresos"
          secondaryLabel="Egresos"
          primaryColor="hsl(var(--primary))"
          secondaryColor="hsl(var(--destructive))"
          primaryData={incomesSeries}
          secondaryData={expensesSeries}
          primaryTotal={incomesTotal}
          secondaryTotal={expensesTotal}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* <TopProductsCard products={activeShop?.analytics?.topProducts} /> */}
        {/* <BestSaleCard
          bestSale={activeShop?.analytics?.bestSale}
          period={effectivePeriod}
        /> */}
      </div>
    </section>
  );
}

