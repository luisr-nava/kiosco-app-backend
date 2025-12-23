import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import {
  createMeasurementUnitAction,
  deleteMeasurementUnitAction,
  updateMeasurementUnitAction,
} from "../actions";
import type {
  CreateMeasurementUnitDto,
  UpdateMeasurementUnitDto,
} from "../interfaces";
import { getErrorMessage } from "@/lib/error-handler";

export const useMeasurementUnitMutations = () => {
  const queryClient = useQueryClient();
  const { activeShopId } = useShopStore();
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["measurement-units", activeShopId],
    });

  const createMutation = useMutation({
    mutationFn: (payload: CreateMeasurementUnitDto) =>
      createMeasurementUnitAction(payload),
    onSuccess: () => {
      toast.success("Unidad de medida creada");
      invalidate();
    },
    onError: (error: unknown) => {
      const { message } = getErrorMessage(
        error,
        "No se pudo crear la unidad de medida",
      );
      toast.error("Error", { description: message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateMeasurementUnitDto;
    }) => updateMeasurementUnitAction(id, payload),
    onSuccess: () => {
      toast.success("Unidad de medida actualizada");
      invalidate();
    },
    onError: (error: unknown) => {
      const { message } = getErrorMessage(
        error,
        "No se pudo actualizar la unidad de medida",
      );
      toast.error("Error", { description: message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMeasurementUnitAction(id),
    onSuccess: () => {
      toast.success("Unidad de medida eliminada");
      invalidate();
    },
    onError: (error: unknown) => {
      const { message } = getErrorMessage(
        error,
        "No se pudo eliminar la unidad de medida",
      );
      toast.error("Error", { description: message });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
};
