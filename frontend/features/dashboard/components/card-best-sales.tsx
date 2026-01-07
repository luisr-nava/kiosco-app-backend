import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useCurrencyFormatter } from "@/src/hooks/useCurrencyFormatter";
import { BestSale } from "../types";

interface CardBestSalesProps {
  bestSales: BestSale | null;
}
export default function CardBestSales({ bestSales }: CardBestSalesProps) {
  const formatCurrency = useCurrencyFormatter();
  return (
    <Card className="mx-4 flex h-[280px] w-1/2 flex-col">
      <CardTitle className="px-4 py-3">Mejor venta del período</CardTitle>

      <CardContent className="flex-1 px-4">
        {!bestSales ? (
          <p className="text-muted-foreground text-sm">No hay ventas destacadas en este período</p>
        ) : (
          <div className="border-primary bg-primary/10 space-y-2 rounded-md border p-4">
            <p className="text-muted-foreground text-sm">
              {new Date(bestSales.date).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="flex justify-end text-sm">
              <p className="justify-end text-lg font-semibold">
                {formatCurrency(bestSales.total ?? 0)}
              </p>
            </div>

            <div className="text-muted-foreground flex justify-end text-sm">
              <span>Total de ítems: {bestSales.itemsCount}</span>
            </div>

            <div className="text-muted-foreground flex justify-between text-sm">
              {/* <span>Detalle</span> */}
              <span className="text-foreground font-medium">
                {/* {bestSales.name ?? "Venta general"} */}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
