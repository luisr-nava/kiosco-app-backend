import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import {
  deleteEmployeeAction,
  createEmployeeAction,
  updateEmployeeAction,
} from "../actions";
import { CreateEmployeeDto } from "../interfaces";

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
      toast.error("No se pudo crear el empleado");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateEmployeeDto>;
    }) => updateEmployeeAction(id, payload),
    onSuccess: () => {
      toast.success("Empleado actualizado");
      invalidateList();
    },
    onError: (error: unknown) => {
      toast.error("No se pudo actualizar el empleado");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEmployeeAction(id),
    onSuccess: () => {
      toast.success("Empleado eliminado");
      invalidateList();
    },
    onError: (error: unknown) => {
      toast.error("No se pudo eliminar el empleado");
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};

