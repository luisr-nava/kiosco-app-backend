import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShopStore } from "@/app/(private)/store/shops.slice";

import {
  CreateCategoryProductDto,
  CreateCategorySupplierDto,
} from "../interfaces";
import {
  updateCategoryProductAction,
  updateCategorySupplierAction,
  createCategoryProductAction,
  createCategorySuppliertAction,
} from "../actions";

export const useCategoryProductCreateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: (payload: CreateCategoryProductDto) =>
      createCategoryProductAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["category-products", activeShopId],
      });
      queryClient.invalidateQueries({ queryKey: ["category-products"] });
    },
  });
};

export const useCategorySupplierCreateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();
  return useMutation({
    mutationFn: (payload: CreateCategorySupplierDto) =>
      createCategorySuppliertAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["category-suppliers", activeShopId],
      });
      queryClient.invalidateQueries({ queryKey: ["category-suppliers"] });
    },
  });
};

export const useCategoryProductUpdateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateCategoryProductDto>;
    }) => updateCategoryProductAction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["category-products", activeShopId],
      });
      queryClient.invalidateQueries({ queryKey: ["category-products"] });
    },
  });
};

export const useCategorySupplierUpdateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateCategorySupplierDto>;
    }) => updateCategorySupplierAction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["category-suppliers", activeShopId],
      });
      queryClient.invalidateQueries({ queryKey: ["category-suppliers"] });
    },
  });
};

