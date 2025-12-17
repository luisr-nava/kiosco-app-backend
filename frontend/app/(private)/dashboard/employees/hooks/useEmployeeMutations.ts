import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import { createEmployeeAction } from "../actions/create.employee.action";
import { updateEmployeeAction } from "../actions/update.employee.action";
import { deleteEmployeeAction } from "../actions/delete.employee.action";
import { CreateEmployeeDto } from "../interfaces";
import { getErrorMessage } from "@/lib/error-handler";

export const useEmployeeMutations = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: ["employees", activeShopId] });

  const createMutation = useMutation({
    mutationFn: (payload: CreateEmployeeDto) => createEmployeeAction(payload),
    onSuccess: () => {
      toast.success("Empleado creado");
      invalidateList();
    },
    onError: (error: unknown) => {
      toast.error("Error", {
        description: getErrorMessage(
          error,
          "No se pudo crear el empleado",
        ).message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateEmployeeDto> }) =>
      updateEmployeeAction(id, payload),
    onSuccess: () => {
      toast.success("Empleado actualizado");
      invalidateList();
    },
    onError: (error: unknown) => {
      toast.error("Error", {
        description: getErrorMessage(
          error,
          "No se pudo actualizar el empleado",
        ).message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEmployeeAction(id),
    onSuccess: () => {
      toast.success("Empleado eliminado");
      invalidateList();
    },
    onError: (error: unknown) => {
      toast.error("Error", {
        description: getErrorMessage(
          error,
          "No se pudo eliminar el empleado",
        ).message,
      });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
