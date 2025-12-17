import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import { CreateProductDto } from "../interfaces";
import { createProductAction } from "../actions/create.product.action";
import { updateProductAction } from "../actions/update.product.action";
import { getErrorMessage } from "@/lib/error-handler";

export const usePoductCreateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: (payload: CreateProductDto) => createProductAction(payload),
    onSuccess: () => {
      toast.success("Producto creado");
      queryClient.invalidateQueries({ queryKey: ["products", activeShopId] });
    },
    onError: (error: unknown) => {
      const { message } = getErrorMessage(
        error,
        "No se pudo crear el producto",
      );
      toast.error("Error", { description: message });
    },
  });
};

export const useProductUpdateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateProductDto> }) =>
      updateProductAction(id, payload),
    onSuccess: () => {
      toast.success("Producto actualizado");
      queryClient.invalidateQueries({ queryKey: ["products", activeShopId] });
    },
    onError: (error: unknown) => {
      const { message } = getErrorMessage(
        error,
        "No se pudo actualizar el producto",
      );
      toast.error("Error", { description: message });
    },
  });
};
