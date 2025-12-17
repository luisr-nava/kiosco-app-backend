import { SaleItem } from "@/lib/types";
import { Product } from "../../products/interfaces";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CartContentProps = {
  items: SaleItem[];
  products: Product[];
  notes: string;
  onNotesChange: (value: string) => void;
  incrementProduct: (productId: string) => void;
  decrementProduct: (productId: string) => void;
  clearCart: () => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
  listClassName?: string;
  totalItems: number;
  totalAmount: number;
};
export const CartContent = ({
  items,
  products,
  notes,
  onNotesChange,
  incrementProduct,
  decrementProduct,
  clearCart,
  handleSubmit,
  isSubmitting,
  listClassName,
  totalItems,
  totalAmount,
}: CartContentProps) => {
  return (
    <div className="hidden lg:block md:w-2/5 lg:w-1/5 mt-6 lg:mt-0">
      <Card className="rounded-md border shadow-lg bg-background sticky top-20">
        <CardHeader>
          <CardTitle >Carrito</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 ">
          <div className={`space-y-1 overflow-y-auto max-h-[55vh] pr-1 `}>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no has agregado productos.
              </p>
            ) : (
              items.map((item, idx) => {
                const product = products.find(
                  (p) => p.id === item.shopProductId,
                );
                const productName = product?.name || "Producto";
                const unitPrice = Number(
                  item.unitPrice || product?.salePrice || 0,
                );
                return (
                  <motion.div
                    key={`${item.shopProductId}-${idx}`}
                    layout
                    className="rounded-md border bg-background p-3 shadow-sm w-full">
                    <div className="grid gap-3 w-full">
                      <div className="flex  justify-between items-center  ">
                        <p className="font-semibold truncate">{productName}</p>
                        <p className="text-base text-muted-foreground">
                          ${unitPrice.toLocaleString("es-AR")} c/u
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            decrementProduct(item.shopProductId || "")
                          }>
                          -
                        </Button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            incrementProduct(item.shopProductId || "")
                          }>
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between text-base text-muted-foreground">
                      <span>Subtotal</span>
                      <span>
                        ${Number(item.subtotal || 0).toLocaleString("es-AR")}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total ítems: {totalItems}</span>
            <span>${totalAmount.toLocaleString("es-AR")}</span>
          </div>

          <div className="space-y-3">
            <div className="grid gap-1">
              <Label>Notas</Label>
              <Input
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Observaciones de la venta"
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="outline"
                onClick={clearCart}
                disabled={items.length === 0 || isSubmitting}>
                Vaciar
              </Button>
              <Button
                className="flex-1"
                disabled={isSubmitting}
                onClick={handleSubmit}>
                {isSubmitting ? "Guardando..." : "Cobrar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
