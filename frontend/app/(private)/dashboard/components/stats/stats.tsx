import { ShopDetail } from "@/lib/types/shop";
import { Card, CardContent } from "@/components/ui/card";

interface StatsProps {
  activeShop: ShopDetail;
}

export const Stats = ({ activeShop }: StatsProps) => {
  const stats = [
    { label: "Empleados", value: activeShop?.employeesCount ?? 0 },
    { label: "Productos", value: activeShop?.productsCount ?? 0 },
    { label: "Categorías", value: activeShop?.categoriesCount ?? 0 },
    { label: "Proveedores", value: activeShop?.suppliersCount ?? 0 },
    { label: "Compras", value: activeShop?.purchasesCount ?? 0 },
    { label: "Ventas", value: activeShop?.salesCount ?? 0 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card className="py-2" key={stat.label}>
          <CardContent>
            <h3 className="text-sm text-muted-foreground py-2">{stat.label}</h3>
            <p className="text-3xl font-bold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

