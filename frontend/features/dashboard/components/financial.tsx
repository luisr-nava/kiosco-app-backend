import { Card, CardContent } from "@/components/ui/card";
import { useSummary } from "../hooks/useSummary";
import { useCurrencyFormatter } from "@/src/hooks/useCurrencyFormatter";
import { Scale, TrendingDown, TrendingUp, Wallet } from "lucide-react";

export default function Financial() {
  const { summary, summaryLoading } = useSummary();
  const formatCurrency = useCurrencyFormatter();
  const financial = [
    {
      label: "Total ventas",
      value: summary?.totalSales ?? 0,
      icon: TrendingUp,
    },
    {
      label: "Total gastos",
      value: summary?.totalExpenses ?? 0,
      icon: TrendingDown,
    },
    {
      label: "Total ingresos",
      value: summary?.totalIncomes ?? 0,
      icon: Wallet,
    },
    {
      label: "Balance",
      value: summary?.balance ?? 0,
      icon: Scale,
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {financial.map((item) => (
        <Card className="py-2" key={item.label}>
          <CardContent className="flex items-center gap-4">
            {summaryLoading ? (
              <p className="text-center">Cargando...</p>
            ) : (
              <div className="flex items-center gap-5">
                <item.icon className="text-primary/80 h-6 w-6 stroke-2" />
                <div className="flex items-center gap-5">
                  <div className="">
                    <p className="text-muted-foreground text-sm">{item.label}</p>
                    <p className="text-2xl font-semibold">{formatCurrency(item.value ?? 0)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
