import { Product } from "../../products/interfaces";
import { PaymentMethod } from "@/app/(private)/settings/payment-method/interfaces";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Separator } from "@radix-ui/react-dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SaleItem } from "../interfaces";

const matchesShopProductId = (product: Product, identifier: string) =>
  product.shopProductId === identifier ||
  product.id === identifier ||
  product.productId === identifier;

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
  paymentMethodId?: string;
  paymentMethods: PaymentMethod[];
  paymentMethodsLoading: boolean;
  onPaymentMethodChange: (methodId: string) => void;
};
export const CartContent = ({
  items = [],
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
  paymentMethodId,
  paymentMethods = [],
  paymentMethodsLoading,
  onPaymentMethodChange,
}: CartContentProps) => {
  const safeItems = items ?? [];
  return (
    <div className="hidden lg:block md:w-2/5 lg:w-1/5 mt-6 lg:mt-0">
      <Card className="rounded-md border shadow-lg bg-background sticky top-20">
        <CardHeader>
          <CardTitle>Carrito</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 ">
          <div className={`space-y-1 overflow-y-auto max-h-[55vh] pr-1 `}>
            {safeItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no has agregado productos.
              </p>
            ) : (
              safeItems.map((item, idx) => {
                const product = products.find((p) =>
                  matchesShopProductId(p, item.shopProductId),
                );
                const productName = product?.name || "Producto";
                const unitPrice = Number(
                  item.unitPrice || product?.salePrice || 0,
                );
                const quantity = Number(item.quantity || 0);
                const stock = product?.stock ?? 0;
                const isIncrementDisabled = stock <= 0 || quantity >= stock;
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
                          disabled={isIncrementDisabled}
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
              <Label>Método de pago</Label>
              <Select
                value={paymentMethodId ?? ""}
                onValueChange={onPaymentMethodChange}
                aria-label="Seleccionar método de pago"
                disabled={paymentMethodsLoading || paymentMethods.length === 0}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      paymentMethodsLoading
                        ? "Cargando métodos..."
                        : "Seleccioná un método"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                  {!paymentMethodsLoading && paymentMethods.length === 0 && (
                    <SelectItem value="__no-methods" disabled>
                      Sin métodos disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
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
                disabled={safeItems.length === 0 || isSubmitting}>
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

