import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { TopProduct } from "../types";

interface CardTopProductProps {
  topProducts: TopProduct[];
}
export default function CardTopProduct({ topProducts }: CardTopProductProps) {
  return (
    <Card className="mx-4 flex h-[280px] w-1/2 flex-col">
      <CardTitle className="px-4 py-3">
        Top 5 de productos más vendidos
      </CardTitle>

      <CardContent className="flex-1 overflow-y-auto px-4">
        {topProducts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No hay productos destacados en este período
          </p>
        ) : (
          topProducts.slice(0, 5).map((product, index) => (
            <div
              key={`${product.productId}-${index}`}
              className={`bg-muted/40 mb-2 flex justify-between rounded-md px-3 py-2 ${
                index === 0 ? "border-primary border" : ""
              }`}
            >
              <p className="flex gap-2 font-medium capitalize">
                <span className="text-muted-foreground">{index + 1}°</span>
                <span>{product.name}</span>
              </p>

              <p className="text-muted-foreground flex gap-1 text-sm">
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
