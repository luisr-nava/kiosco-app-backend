import { Card, CardContent } from "@/components/ui/card";
import { useSummary } from "../hooks/useSummary";
import {
  CalendarClock,
  Package,
  ShoppingCart,
  Tags,
  Users,
} from "lucide-react";

export default function Stats() {
  const { summary, summaryLoading } = useSummary();
  const stats = [
    { label: "Empleados", value: summary?.employeesCount ?? 0, icon: Users },
    { label: "Productos", value: summary?.productsCount ?? 0, icon: Package },
    { label: "Categorías", value: summary?.categoriesCount ?? 0, icon: Tags },
    {
      label: "Compras",
      value: summary?.purchasesCount ?? 0,
      icon: ShoppingCart,
    },
    { label: "Ventas", value: summary?.salesCount ?? 0, icon: ShoppingCart },
    {
      label: "Últimas compras (30 días)",
      value: summary?.recentPurchasesLast30Days ?? 0,
      icon: CalendarClock,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card className="py-2" key={stat.label}>
          <CardContent className="flex items-center gap-4">
            <stat.icon className="text-primary/80 h-6 w-6 stroke-2" />
            <div className="">
              <h3 className="text-muted-foreground py-2 text-sm">
                {stat.label}
              </h3>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
