import { kioscoApi } from "@/lib/kioscoApi";
import type { GetPaymentMethodsResponse, PaymentMethod } from "../interfaces";

export const getPaymentMethodsAction = async (
  shopId: string,
): Promise<{ paymentMethods: PaymentMethod[]; pagination: GetPaymentMethodsResponse["meta"] }> => {
  const { data } = await kioscoApi.get<GetPaymentMethodsResponse>(
    `/payment-method/shop/${shopId}`,
  );

  return {
    paymentMethods: data.data,
    pagination: data.meta,
  };
};
