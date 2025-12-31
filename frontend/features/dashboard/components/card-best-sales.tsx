import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useCurrencyFormatter } from "@/src/hooks/useCurrencyFormatter";
import { BestSale } from "../types";

interface CardBestSalesProps {
  bestSales: BestSale | null;
}
export default function CardBestSales({ bestSales }: CardBestSalesProps) {
  const formatCurrency = useCurrencyFormatter();
  return (
    <Card className="mx-4 w-1/2 h-[280px] flex flex-col">
      <CardTitle className="px-4 py-3">Mejor venta del período</CardTitle>

      <CardContent className="flex-1 px-4">
        {!bestSales ? (
          <p className="text-sm text-muted-foreground">
            No hay ventas destacadas en este período
          </p>
        ) : (
          <div className="rounded-md border border-primary bg-primary/10 p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              {new Date(bestSales.date).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="flex justify-end text-sm">
              <p className="text-lg font-semibold justify-end">
                {formatCurrency(bestSales.total ?? 0)}
              </p>
            </div>

            <div className="flex justify-end text-sm text-muted-foreground">
              <span>Total de ítems: {bestSales.itemsCount}</span>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              {/* <span>Detalle</span> */}
              <span className="font-medium text-foreground">
                {/* {bestSales.name ?? "Venta general"} */}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

