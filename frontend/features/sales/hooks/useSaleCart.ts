import { Product } from "@/features/products/types";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { SaleFormValues } from "./useSaleForm";

export const useSaleCart = (form: UseFormReturn<SaleFormValues>) => {
  const { control, watch } = form;
  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "items",
  });
  const items = watch("items");
  const [initialQuantities, setInitialQuantities] = useState<
    Map<string, number>
  >(new Map());
  const resolveShopProductId = (product: Product): string =>
    product.shopProductId || product.id || product.productId || "";

  useEffect(() => {
    if (form.formState.isDirty) return;

    const map = new Map<string, number>();
    items.forEach((item) => {
      if (item.shopProductId) {
        map.set(item.shopProductId, item.quantity);
      }
    });
    setInitialQuantities(map);
  }, [form.formState.isDirty, items]);

  const getInitialQuantity = (shopProductId: string) =>
    initialQuantities.get(shopProductId) ?? 0;

  const incrementProduct = (product: Product) => {
    const shopProductId = resolveShopProductId(product);
    if (!shopProductId) {
      toast.error("Producto inválido");
      return;
    }

    const stock = Number(product.stock ?? 0);
    const initialQty = getInitialQuantity(shopProductId);
    const maxAllowed = Math.max(0, stock + initialQty);

    const index = items.findIndex((i) => i.shopProductId === shopProductId);
    const currentQty = index >= 0 ? items[index].quantity : 0;

    if (currentQty >= maxAllowed) {
      toast.error("Stock insuficiente");
      return;
    }

    if (index >= 0) {
      update(index, {
        ...items[index],
        quantity: currentQty + 1,
      });
      return;
    }

    append({
      shopProductId,
      quantity: 1,
    });
  };


  const decrementProduct = (shopProductId: string) => {
    const index = items.findIndex((i) => i.shopProductId === shopProductId);
    if (index < 0) return;

    const current = items[index];
    const quantity = current.quantity - 1;

    if (quantity <= 0) {
      remove(index);
      return;
    }

    update(index, {
      ...current,
      quantity,
    });
  };

  const totalItems = useMemo(
    () => items.reduce((acc, i) => acc + i.quantity, 0),
    [items]
  );

  //   const totalAmount = useMemo(
  //     () => items.reduce((acc, i) => acc + Number(i.subtotal ?? 0), 0),
  //     [items]
  //   );
  const incrementProductById = (productId: string, products: Product[]) => {
    const product = products.find((p) => resolveShopProductId(p) === productId);
    if (product) {
      incrementProduct(product);
    }
  };
  return {
    items: fields,
    incrementProduct,
    decrementProduct,
    totalItems,
    // totalAmount,
    resolveShopProductId,
    incrementProductById,
    getInitialQuantity,
  };
};
