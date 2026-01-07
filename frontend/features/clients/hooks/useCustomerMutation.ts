import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCustomerAction } from "../actions/create.customer.action";
import { updateCustomerAction } from "../actions/update.customer.action";
import { deleteCustomerAction } from "../actions";
import { useShopStore } from "@/features/shop/shop.store";
import { CreateCustomerDto } from "../types";

export const useCustomerCreateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: (payload: CreateCustomerDto) => createCustomerAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", activeShopId] });
    },
  });
};

export const useCustomerUpdateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateCustomerDto> }) =>
      updateCustomerAction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", activeShopId] });
    },
  });
};

export const useCustomerDeleteMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteCustomerAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", activeShopId] });
    },
  });
};
