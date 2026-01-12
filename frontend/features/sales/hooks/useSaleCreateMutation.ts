import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShopStore } from "@/features/shop/shop.store";
import { CreateSaleDto } from "../types";
import { createSaleAction } from "../actions";
import { GetAllProductResponse, Product } from "@/features/products/types";
import { updateSaleAction } from "../actions/update.sale.action";
import { SaleHistory } from "@/features/sales-history/types";
import { Pagination } from "@/src/types";
type ProductsQueryData = {
  products: Product[];
  pagination: GetAllProductResponse["pagination"];
};

export const useSaleCreateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: (payload: CreateSaleDto) => createSaleAction(payload),

    onSuccess: (_data, payload) => {
      if (activeShopId) {
        queryClient.invalidateQueries({
          queryKey: ["sales", activeShopId],
        });

        queryClient.setQueryData<ProductsQueryData>(
          ["products", activeShopId],
          (old) => {
            if (!old) return old;

            return {
              ...old,
              products: old.products.map((product) => {
                const soldItem = payload.items.find(
                  (item) =>
                    item.shopProductId === (product.shopProductId ?? product.id)
                );

                if (!soldItem) return product;

                return {
                  ...product,
                  stock: Math.max(0, Number(product.stock) - soldItem.quantity),
                };
              }),
            };
          }
        );

        queryClient.invalidateQueries({
          queryKey: ["cash-register-state", activeShopId],
        });
      }
    },
  });
};

type SalesQueryData = {
  sales: SaleHistory[];
  pagination: Pagination;
};

export const useSaleUpdateMutation = () => {
  const queryClient = useQueryClient();

  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: ({
      saleId,
      payload,
    }: {
      saleId: string;
      payload: Parameters<typeof updateSaleAction>[1];
    }) => updateSaleAction(saleId, payload),

    onSuccess: (updatedSale, { saleId }) => {
      if (!activeShopId) return;

      queryClient.setQueriesData<SalesQueryData>(
        { queryKey: ["sales", activeShopId], exact: false },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            sales: old.sales.map((sale) => {
              if (sale.id !== saleId) return sale;

              return {
                ...sale,
                items: updatedSale.items ?? sale.items,
                totalAmount: updatedSale.totalAmount ?? sale.totalAmount,
              };
            }),
          };
        }
      );

      queryClient.invalidateQueries({
        queryKey: ["sales", activeShopId],
        exact: false,
      });

      // venta individual
      queryClient.invalidateQueries({
        queryKey: ["sale", saleId],
      });

      // opcional pero recomendado (totales / caja)
      queryClient.invalidateQueries({
        queryKey: ["cash-register-state", activeShopId],
      });
    },
  });
};
