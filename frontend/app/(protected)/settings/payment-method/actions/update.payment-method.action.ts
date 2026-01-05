import { kioscoApi } from "@/lib/kioscoApi";
import type { CreatePaymentMethodDto, PaymentMethod } from "../interfaces";

export const updatePaymentMethodAction = async (
  id: string,
  payload: Partial<CreatePaymentMethodDto>,
): Promise<PaymentMethod> => {
  const { data } = await kioscoApi.patch<PaymentMethod>(
    `/payment-method/${id}`,
    payload,
  );

  return data;
};

