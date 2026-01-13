"use client";
import { Card, CardContent } from "@/components/ui/card";
import {
  MobileCheckoutBar,
  ProductCard,
  ProductCardContent,
} from "@/features/sales/components";
import {
  useSaleByIdQuery,
  useSaleCart,
  useSaleCreateFlow,
  useSaleDerivedState,
  useSaleForm,
} from "@/features/sales/hooks";
import { mapSaleToForm } from "@/features/sales/hooks/useMapSaleToForm";
import { useProductQuery } from "@/features/products/hooks";
import { usePaymentMethods } from "../../settings/payment-method/hooks";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SalesPage() {
  const form = useSaleForm();
  const searchParams = useSearchParams();

  const {
    items,
    incrementProduct,
    decrementProduct,
    totalItems,
    totalAmount,
    resolveShopProductId,
    incrementProductById,
    getInitialQuantity,
  } = useSaleCart(form);
  const editSaleId = searchParams.get("editSaleId");
  const { submitSale, isSubmitting } = useSaleCreateFlow(
    form,
    editSaleId ?? undefined
  );
  const { products } = useProductQuery({});
  const { paymentMethods } = usePaymentMethods();
  const paymentMethodId = form.watch("paymentMethodId");
  
  const { productsForGrid } = useSaleDerivedState({
    items,
    products,
    resolveShopProductId,
    getInitialQuantity,
  });

  const canSubmit =
    items.length > 0 && Boolean(paymentMethodId) && !isSubmitting;

  const cart = {
    items,
    products,
    totalItems,
    totalAmount,
    increment: (productId: string) => incrementProductById(productId, products),
    decrement: decrementProduct,
    clear: () => form.setValue("items", []),
    getInitialQuantity,
    incrementProductById
  };

  const checkout = {
    canSubmit,
    isSubmitting,
    onSubmit: submitSale,
    paymentMethods,
  };

  const { sale } = useSaleByIdQuery(editSaleId || undefined);

  useEffect(() => {
    if (!sale) return;
    const mapped = mapSaleToForm(sale);
    const mergedItems = mapped.items.map((item) => {
      const product = products.find(
        (p) => String(p.shopProductId ?? "") === String(item.shopProductId)
      );
      if (!product) return item;
      return {
        ...item,
        productName: item.productName || product.name,
        allowPriceOverride:
          item.allowPriceOverride ?? product.allowPriceOverride ?? false,
      };
    });
    form.reset({ ...mapped, items: mergedItems });
  }, [form, sale, products]);

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="lg:flex lg:items-start lg:gap-4">
        <div className="space-y-4 lg:w-4/5">
          <Card className="h-full lg:max-h-[80vh]">
            <CardContent className="h-full space-y-4 lg:overflow-y-auto">
              {products.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No hay productos disponibles en esta tienda.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:pr-1 xl:grid-cols-5">
                  {productsForGrid.map(
                    ({ product, isAddDisabled, quantityInCart }) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      incrementProduct={incrementProduct}
                      isAddDisabled={isAddDisabled}
                      quantityInCart={quantityInCart}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 hidden md:w-2/5 lg:mt-0 lg:block lg:w-1/5">
          <ProductCardContent form={form} cart={cart} checkout={checkout} />
        </div>
      </div>

      <div className="lg:hidden">
        <MobileCheckoutBar cart={cart} checkout={checkout}>
          <ProductCardContent form={form} cart={cart} checkout={checkout} />
        </MobileCheckoutBar>
      </div>
    </div>
  );
}
