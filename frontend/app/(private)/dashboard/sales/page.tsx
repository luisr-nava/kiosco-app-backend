"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ShopLoading } from "@/components/shop-loading";
import { ShopEmpty } from "@/components/shop-emty";
import { useSale } from "./hooks/useSale";
import { CartContent } from "./components/cart-content";
import { CardProduct } from "./components/card-product";

export default function VentasPage() {
  const { activeShopId, activeShopLoading } = useShopStore();

  const {
    isCartOpen,
    setIsCartOpen,
    products,
    total,
    incrementProduct,
    incrementProductById,
    decrementProduct,
    handleSubmit,
    totalItems,
    isSubmitting,
    clearCart,
    items,
    notes,
    setNotes,
    productsLoading,
    paymentMethods,
    paymentMethodsLoading,
    paymentMethodId,
    handlePaymentMethodChange,
    resolveShopProductId,
  } = useSale();

  const quantityByShopProductId = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      if (!item.shopProductId) return;
      map.set(item.shopProductId, Number(item.quantity || 0));
    });
    return map;
  }, [items]);

  if (!activeShopId) return <ShopEmpty />;

  if (activeShopLoading) return <ShopLoading />;

  {
    /* <CardHeader className="pb-2">
    <CardDescription>
      Toca un producto para agregarlo al carrito.
    </CardDescription>
  </CardHeader> */
  }
  return (
    <div className="space-y-6 pb-16 lg:pb-0 ">
      <div className="lg:flex lg:items-start lg:gap-4">
        <div className="lg:w-4/5 space-y-4">
          <Card className="h-full lg:max-h-[80vh]">
            <CardContent className="h-full space-y-4 lg:overflow-y-auto">
              {productsLoading ? (
                <p className="text-sm text-muted-foreground">
                  Cargando productos...
                </p>
              ) : products.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay productos disponibles en esta tienda.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 lg:pr-1">
                  {products.map((product) => {
                    const resolvedShopProductId = resolveShopProductId(product);
                    const stock = Math.max(0, Number(product.stock ?? 0));
                    const quantityInCart =
                      quantityByShopProductId.get(resolvedShopProductId) ?? 0;
                    const isAddDisabled =
                      stock <= 0 || quantityInCart >= stock;

                    return (
                      <CardProduct
                        key={product.id}
                        product={product}
                        incrementProduct={incrementProduct}
                        isAddDisabled={isAddDisabled}
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <CartContent
          items={items}
          products={products}
          notes={notes}
          onNotesChange={setNotes}
          incrementProduct={incrementProductById}
          decrementProduct={decrementProduct}
          clearCart={clearCart}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          listClassName="max-h-[60vh]"
          totalItems={totalItems}
          totalAmount={total}
          paymentMethods={paymentMethods}
          paymentMethodsLoading={paymentMethodsLoading}
          paymentMethodId={paymentMethodId}
          onPaymentMethodChange={handlePaymentMethodChange}
        />
      </div>

      <Drawer open={isCartOpen} onOpenChange={setIsCartOpen}>
        <div className="lg:hidden">
          <div className="fixed bottom-4 left-4 right-4 z-40">
            <div className="flex items-center gap-3 rounded-full border bg-background/95 px-4 py-3 shadow-lg backdrop-blur">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Carrito</p>
                <p className="font-semibold truncate">
                  {totalItems} ítems · ${total.toLocaleString("es-AR")}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <DrawerTrigger asChild>
                  <Button size="sm" variant="outline">
                    Ver
                  </Button>
                </DrawerTrigger>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting || items.length === 0}>
                  {isSubmitting ? "Guardando..." : "Cobrar"}
                </Button>
              </div>
            </div>
          </div>

          <DrawerContent className="pb-6">
            <DrawerHeader className="relative flex flex-col items-center gap-1 pb-2">
              <DrawerClose asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Cerrar carrito"
                  className="absolute right-2 top-2">
                  <X className="h-5 w-5" />
                </Button>
              </DrawerClose>
              <DrawerTitle>Carrito</DrawerTitle>
              <DrawerDescription>
                Revisa tu carrito antes de cobrar.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 space-y-4 pb-2">
              <CartContent
                items={items}
                products={products}
                notes={notes}
                onNotesChange={setNotes}
                incrementProduct={incrementProductById}
                decrementProduct={decrementProduct}
                clearCart={clearCart}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                listClassName="max-h-[45vh]"
                totalItems={totalItems}
                totalAmount={total}
                paymentMethods={paymentMethods}
                paymentMethodsLoading={paymentMethodsLoading}
                paymentMethodId={paymentMethodId}
                onPaymentMethodChange={handlePaymentMethodChange}
              />
            </div>
          </DrawerContent>
        </div>
      </Drawer>
    </div>
  );
}
