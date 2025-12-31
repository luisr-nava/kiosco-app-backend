import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { TopProduct } from "../types";

interface CardTopProductProps {
  topProducts: TopProduct[];
}
export default function CardTopProduct({ topProducts }: CardTopProductProps) {
  return (
    <Card className="mx-4 w-1/2 h-[280px] flex flex-col">
      <CardTitle className="px-4 py-3">
        Top 5 de productos más vendidos
      </CardTitle>

      <CardContent className="flex-1 overflow-y-auto px-4">
        {topProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay productos destacados en este período
          </p>
        ) : (
          topProducts.slice(0, 5).map((product, index) => (
            <div
              key={`${product.productId}-${index}`}
              className={`flex justify-between rounded-md px-3 py-2 mb-2 bg-muted/40 ${
                index === 0 ? "border border-primary" : ""
              }`}>
              <p className="font-medium capitalize flex gap-2">
                <span className="text-muted-foreground">{index + 1}°</span>
                <span>{product.name}</span>
              </p>

              <p className="text-sm text-muted-foreground flex gap-1">
                Cantidad:
                <span className="font-medium">{product.quantity}</span>
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

