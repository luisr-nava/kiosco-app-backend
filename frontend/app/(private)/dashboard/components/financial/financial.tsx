import { Card, CardContent } from "@/components/ui/card";
import { ShopDetail } from "@/lib/types/shop";
interface FinancialProps {
  activeShop: ShopDetail;
}
export const Financial = ({ activeShop }: FinancialProps) => {
  const financial = [
    { label: "Total ventas", value: activeShop?.totalSales ?? 0 },
    { label: "Total gastos", value: activeShop?.totalExpenses ?? 0 },
    { label: "Total ingresos", value: activeShop?.totalIncomes ?? 0 },
    { label: "Balance", value: activeShop?.balance ?? 0 },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {financial.map((item) => (
        <Card className="py-2" key={item.label}>
          <CardContent>
            <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
              <div key={item.label} className="space-y-1">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-semibold">
                  ${item.value?.toLocaleString("es-AR") ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

