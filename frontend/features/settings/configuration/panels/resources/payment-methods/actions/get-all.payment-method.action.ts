import { kioscoApi } from "@/lib/kioscoApi";
import { GetPaymentMethodsResponse, PaymentMethod } from "../types";

type GetPaymentMethodsParams = {
  shopId: string;
  page?: number;
  limit?: number;
};

export const getPaymentMethodsAction = async (
  params: GetPaymentMethodsParams
): Promise<{
  paymentMethods: PaymentMethod[];
  pagination: GetPaymentMethodsResponse["meta"];
}> => {
  const { data } = await kioscoApi.get<GetPaymentMethodsResponse>(
    `/payment-method/shop/${params.shopId}`,
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      },
    }
  );

  return {
    paymentMethods: data.data,
    pagination: data.meta,
  };
};
