import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { CreatePaymentMethodDto, PaymentMethod } from "../types";
import {
  usePaymentMethodCreateMutation,
  usePaymentMethodDeleteMutation,
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
  const deleteMutation = usePaymentMethodDeleteMutation();

  const form = useForm<CreatePaymentMethodDto>({
    defaultValues: initialForm,
  });

  const onSubmit = async (values: CreatePaymentMethodDto) => {
    if (!activeShopId) {
      toast.error("No hay tienda activa");
      return;
    }
  };
  //   const basePayload: CreatePaymentMethodDto = {
  //     ...values,
  //     shopIds: [activeShopId],
  //   };
  //   if (editCategory) {
  //     updateMutation.mutate(
  //       {
  //         id: editCategory.id,
  //         payload: basePayload,
  //       },
  //       {
  //         onSuccess: () => {
  //           toast.success("Categoria actualizada");
  //           form.reset({ ...initialForm });
  //           onEditDone?.();
  //         },
  //         onError: () => {
  //           toast.error("No se pudo actualizar la categoria");
  //         },
  //       }
  //     );
  //     return;
  //   } else {
  //     createMutation.mutate(basePayload, {
  //       onSuccess: () => {
  //         toast.success("Categoria creada");
  //         form.reset({ ...initialForm });
  //       },
  //       onError: () => {
  //         toast.error("No se pudo actualizar la categoria");
  //       },
  //     });
  //   }
  // };
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
