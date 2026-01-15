import { useForm } from "react-hook-form";
import {
  CreateMeasurementUnitDto,
  MeasurementUnit,
  UpdateMeasurementUnitDto,
} from "../types";
import { useShopStore } from "@/features/shop/shop.store";
import {
  useMeasurementUnitCreateMutation,
  useMeasurementUnitUpdateMutation,
} from "./useMeasurementUnitMutations";
import { useEffect } from "react";
import { toast } from "sonner";
const initialForm: CreateMeasurementUnitDto = {
  name: "",
  code: "",
  shopIds: [],
};

function mapMeasurementUnitsForm(
  measurement: MeasurementUnit,
  initialForm: CreateMeasurementUnitDto
) {
  return {
    ...initialForm,
    name: measurement.name,
    code: measurement.code,
  };
}

export const useMeasurementUnitsForm = (
  editMeasurementUnit?: MeasurementUnit,
  onEditDone?: () => void
) => {
  const { activeShopId } = useShopStore();

  const createMutation = useMeasurementUnitCreateMutation();
  const updateMutation = useMeasurementUnitUpdateMutation();
  const form = useForm<CreateMeasurementUnitDto>({
    defaultValues: initialForm,
  });

  const onSubmit = async (values: CreateMeasurementUnitDto) => {
    if (!activeShopId) {
      toast.error("No hay tienda activa");
      return;
    }
    const basePayload: CreateMeasurementUnitDto = {
      ...values,
    };
    const payload: UpdateMeasurementUnitDto = {
      name: values.name,
      code: values.code,
    };

    if (editMeasurementUnit) {
      updateMutation.mutate(
        {
          id: editMeasurementUnit.id,
          payload,
        },
        {
          onSuccess: () => {
            toast.success("Unidad de medida actualizada");
            form.reset({ ...initialForm });
            onEditDone?.();
          },
          onError: () => {
            toast.error("No se pudo actualizar la unidad de medida");
          },
        }
      );
      return;
    }

    createMutation.mutate(
      { ...basePayload, shopIds: [activeShopId] },
      {
        onSuccess: () => {
          toast.success("Unidad de medida creada");
          form.reset({ ...initialForm });
        },
        onError: (err) => {
          toast.error(err.message);
        },
      }
    );
  };
  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!editMeasurementUnit) {
      form.reset(initialForm);
      return;
    }

    form.reset(mapMeasurementUnitsForm(editMeasurementUnit, initialForm));
  }, [editMeasurementUnit, form]);

  return {
    form,
    onSubmit,
    isLoading,
    initialForm,
    isEditing: Boolean(editMeasurementUnit),
  };
};
