import { useMemo } from "react";
import { Product } from "@/features/products/types";
import { SaleItem } from "../types";

type Params = {
  items: SaleItem[];
  products: Product[];
  resolveShopProductId: (product: Product) => string;
  getInitialQuantity?: (shopProductId: string) => number;
};

export const useSaleDerivedState = ({
  items,
  products,
  resolveShopProductId,
  getInitialQuantity,
}: Params) => {
  const quantityByShopProductId = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      map.set(item.shopProductId, item.quantity);
    });
    return map;
  }, [items]);

  const totalAmount = useMemo(() => {
    return items.reduce((acc, item) => {
      const product = products.find(
        (p) => resolveShopProductId(p) === item.shopProductId
      );

      const unitPrice =
        product?.finalSalePrice || product?.salePrice || product?.price || 0;

      return acc + unitPrice * item.quantity;
    }, 0);
  }, [items, products, resolveShopProductId]);

  const productsForGrid = useMemo(() => {
    return products.map((product) => {
      const shopProductId = resolveShopProductId(product);
      const stock = Math.max(0, Number(product.stock ?? 0));
      const initialQty = getInitialQuantity?.(shopProductId) ?? 0;
      const maxAllowed = Math.max(0, stock + initialQty);
      const quantityInCart = quantityByShopProductId.get(shopProductId) ?? 0;

      return {
        product,
        quantityInCart,
        maxAllowed,
        isAddDisabled: quantityInCart >= maxAllowed,
      };
    });
  }, [getInitialQuantity, products, quantityByShopProductId, resolveShopProductId]);

  return {
    totalAmount,
    productsForGrid,
  };
};
