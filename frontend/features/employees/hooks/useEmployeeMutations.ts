import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useShopStore } from "@/features/shop/shop.store";
import { CreateEmployeeDto } from "../types";
import {
  createAuthUserAction,
  createEmployeeAction,
  deleteEmployeeAction,
  updateEmployeeAction,
} from "../actions";
import { updateAuthUserAction } from "../actions/update.employee.user.action";

// toast.success("Empleado creado");
// toast.error("No se pudo crear el empleado");
export const useEmployeeCreateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  return useMutation({
    mutationFn: async (payload: CreateEmployeeDto) => {
      const { shopIds, id, ...rest } = payload;
      const authResponse = await createAuthUserAction(rest);
      const userId = authResponse.userId;
      const { password, ...employeeData } = payload;
      employeeData.id = userId;
      return createEmployeeAction(employeeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", activeShopId] });
    },
  });
};

export const useEmployeeUpdateMutation = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateEmployeeDto>;
    }) => {
      const { password, shopIds, ...safePayload } = payload;

      await updateAuthUserAction(id, safePayload);

      return updateEmployeeAction(id, safePayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", activeShopId] });
    },
  });
};
