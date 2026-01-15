import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { CreatePaymentMethodDto, PaymentMethod } from "../types";
import {
  usePaymentMethodCreateMutation,
  usePaymentMethodUpdateMutation,
} from "./usePaymentMethodMutations";
import { useShopStore } from "@/features/shop/shop.store";
import { toast } from "sonner";

const initialForm: CreatePaymentMethodDto = {
  name: "",
  code: "",
  description: "",
  shopId: "",
};
function mapPaymentMethodForm(
  paymentMethod: PaymentMethod,
  initialForm: CreatePaymentMethodDto
) {
  return {
    ...initialForm,
    name: paymentMethod.name,
    code: paymentMethod.code,
    description: paymentMethod.description,
  };
}

export const usePaymentMethodForm = (
  editPaymentMethod?: PaymentMethod,
  onEditDone?: () => void
) => {
  const { activeShopId } = useShopStore();

  const createMutation = usePaymentMethodCreateMutation();
  const updateMutation = usePaymentMethodUpdateMutation();

  const form = useForm<CreatePaymentMethodDto>({
    defaultValues: initialForm,
  });

  const onSubmit = async (values: CreatePaymentMethodDto) => {
    if (!activeShopId) {
      toast.error("No hay tienda activa");
      return;
    }
    const basePayload: CreatePaymentMethodDto = {
      ...values,
      shopId: activeShopId,
    };

    if (editPaymentMethod) {
      updateMutation.mutate(
        {
          id: editPaymentMethod.id,
          payload: basePayload,
        },
        {
          onSuccess: () => {
            toast.success("Método de pago actualizado");
            form.reset({ ...initialForm });
            onEditDone?.();
          },
          onError: () => {
            toast.error("No se pudo actualizar el método de pago");
          },
        }
      );
      return;
    }

    createMutation.mutate(basePayload, {
      onSuccess: () => {
        toast.success("Método de pago creado");
        form.reset({ ...initialForm });
      },
      onError: () => {
        toast.error("No se pudo crear el método de pago");
      },
    });
  };
  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!editPaymentMethod) {
      form.reset(initialForm);
      return;
    }

    form.reset(mapPaymentMethodForm(editPaymentMethod, initialForm));
  }, [editPaymentMethod, form]);

  return {
    form,
    onSubmit,
    isLoading,
    initialForm,
    isEditing: Boolean(editPaymentMethod),
  };
};
