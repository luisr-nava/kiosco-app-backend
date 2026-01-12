import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartUI, CheckoutUI } from "../types";
import { Product } from "@/features/products/types";
import { Separator } from "@/components/ui/separator";
import { Controller, UseFormReturn } from "react-hook-form";
import { SaleFormValues } from "../hooks/useSaleForm";
import { useCurrencyFormatter } from "@/src/hooks/useCurrencyFormatter";

const matchesShopProductId = (product: Product, identifier: string) =>
  product.shopProductId === identifier ||
  product.id === identifier ||
  product.productId === identifier;

type ProductCardContentProps = {
  form: UseFormReturn<SaleFormValues>;
  cart: CartUI;
  checkout: CheckoutUI;
};

export default function ProductCardContent({
  form,
  cart,
  checkout,
}: ProductCardContentProps) {
  const {
    items,
    products,
    totalItems,
    totalAmount,
    increment,
    decrement,
    clear,
    getInitialQuantity,
  } = cart;

  const { canSubmit, isSubmitting, onSubmit, paymentMethods } = checkout;
  
  const formatCurrency = useCurrencyFormatter();
  const safeItems = items ?? [];
  return (
    <div className={``}>
      <Card className="bg-background sticky top-20 rounded-md border shadow-lg">
        <CardHeader>
          <CardTitle>Carrito</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={`max-h-[55vh] space-y-1 overflow-y-auto pr-1`}>
            {safeItems.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Aún no has agregado productos.
              </p>
            ) : (
              safeItems.map((item, idx) => {
                const product = products.find((p) =>
                  matchesShopProductId(p, item.shopProductId)
                );
                const productName = product?.name || "Producto";
                const unitPrice = Number(product?.salePrice || 0);
                const quantity = Number(item.quantity || 0);
                const subtotal = unitPrice * quantity;
                const stock = Math.max(0, Number(product?.stock ?? 0));
                const initialQty =
                  getInitialQuantity?.(item.shopProductId) ?? 0;
                const maxAllowed = Math.max(0, stock + initialQty);
                const isIncrementDisabled = quantity >= maxAllowed;
                return (
                  <motion.div
                    key={`${item.shopProductId}-${idx}`}
                    layout
                    className="bg-background w-full rounded-md border p-3 shadow-sm"
                  >
                    <div className="grid w-full gap-3">
                      <div className="flex items-center justify-between">
                        <p className="truncate font-semibold">{productName}</p>
                        <p className="text-muted-foreground text-base">
                          ${unitPrice.toLocaleString("es-AR")} c/u
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => decrement(item.shopProductId || "")}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isIncrementDisabled}
                          onClick={() => increment(item.shopProductId || "")}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="text-muted-foreground mt-2 flex justify-between text-base">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total ítems: {totalItems}</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>

          <div className="space-y-3">
            <div className="grid gap-1">
              <Controller
                control={form.control}
                name="paymentMethodId"
                rules={{ required: "El método de pago es requerido" }}
                render={({ field, fieldState }) => (
                  <div className="grid gap-1">
                    <Label>
                      Método de pago <span className="text-destructive">*</span>
                    </Label>

                    <Select
                      key={field.value}
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sin método de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {fieldState.error && (
                      <p className="text-destructive text-xs">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
            <div className="grid gap-1">
              <Controller
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <div className="grid gap-1">
                    <Label>Notas</Label>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Observaciones de la venta"
                    />
                  </div>
                )}
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="outline"
                onClick={clear}
                disabled={items.length === 0 || isSubmitting}
              >
                Vaciar
              </Button>

              <Button
                className="flex-1"
                disabled={isSubmitting || !canSubmit}
                onClick={onSubmit}
              >
                {isSubmitting ? "Guardando..." : "Cobrar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
