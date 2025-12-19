import { kioscoApi } from "@/lib/kioscoApi";
import type { CreatePaymentMethodDto, PaymentMethod } from "../interfaces";

export const createPaymentMethodAction = async (
  payload: CreatePaymentMethodDto,
): Promise<PaymentMethod> => {
  const { data } = await kioscoApi.post<{ data: PaymentMethod }>(
    "/payment-method",
    payload,
  );

  return data.data;
};
