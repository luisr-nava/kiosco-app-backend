import { toast } from "sonner";
import type { UseFormReturn } from "react-hook-form";
import {
  useSaleCreateMutation,
  useSaleUpdateMutation,
} from "./useSaleCreateMutation";
import { useShopStore } from "@/features/shop/shop.store";
import { CreateSaleDto } from "../types";
import { SaleFormValues } from "./useSaleForm";
import { useRouter } from "next/navigation";

export const useSaleCreateFlow = (
  form: UseFormReturn<SaleFormValues>,
  saleId?: string
) => {
  const router = useRouter();
  const { activeShopId } = useShopStore();
  const createSale = useSaleCreateMutation();
  const updateSale = useSaleUpdateMutation();

  const submitSale = () => {
    if (!activeShopId) return;

    const values = form.getValues();

    if (!values.items || values.items.length === 0) {
      toast.error("Agregá al menos un producto");
      return;
    }
    if (!values.paymentMethodId) {
      toast.error("Seleccioná un método de pago");
      return;
    }

    const payload: CreateSaleDto = {
      paymentMethodId: values.paymentMethodId,
      notes: values.notes || undefined,
      items: values.items.map((item) => ({
        shopProductId: item.shopProductId,
        quantity: item.quantity,
      })),
    };
    if (saleId) {
      updateSale.mutate(
        { saleId, payload },
        {
          onSuccess: () => {
            toast.success("Venta actualizada");
            router.push("/dashboard/sales/history");
          },
          onError: () => {
            toast.error("No se pudo actualizar la venta");
          },
        }
      );
      return;
    }
    createSale.mutate(
      { ...payload, shopId: activeShopId },
      {
        onSuccess: () => {
          toast.success("Venta registrada");
          form.reset();
        },
        onError: () => {
          toast.error("No se pudo registrar la venta");
        },
      }
    );
  };

  return {
    submitSale,
    isSubmitting: createSale.isPending,
  };
};
