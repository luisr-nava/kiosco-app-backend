import { kioscoApi } from "@/lib/kioscoApi";
import { unwrapResponse } from "@/lib/api/utils";
import type { CreatePaymentMethodDto, PaymentMethod } from "../interfaces";

export const updatePaymentMethodAction = async (
  id: string,
  payload: Partial<CreatePaymentMethodDto>,
): Promise<PaymentMethod> => {
  const { data } = await kioscoApi.patch<PaymentMethod | { data: PaymentMethod }>(
    `/payment-method/${id}`,
    payload,
  );

  return unwrapResponse(data);
};
