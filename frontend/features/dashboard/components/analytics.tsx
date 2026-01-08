"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Period } from "@/utils";
import { useAnalytics } from "../hooks";
import CardBars from "./card-bars";
import CardTopProduct from "./card-top-product";
import CardBestSales from "./card-best-sales";

export default function Analytics() {
  const {
    hasAnyValue,
    period,
    setPeriod,
    PERIOD_OPTIONS,
    analyticsLoading,
    salesVsPurchasesChart,
    incomesVsExpensesChart,
    topProducts,
    bestSales,
  } = useAnalytics();

  return (
    <Card className="">
      <CardHeader className="flex w-full justify-end">
        <CardTitle className="w-1/2 text-base font-semibold md:w-1/10">
          <Select
            value={period}
            onValueChange={(value) => setPeriod(value as Period)}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardBars
        period={period}
        hasAnyValue={hasAnyValue}
        analyticsLoading={analyticsLoading}
        incomesVsExpensesChart={incomesVsExpensesChart}
        salesVsPurchasesChart={salesVsPurchasesChart}
      />

      <div className="md:flex">
        <CardTopProduct topProducts={topProducts} />
        <CardBestSales bestSales={bestSales} />
      </div>
    </Card>
  );
}
