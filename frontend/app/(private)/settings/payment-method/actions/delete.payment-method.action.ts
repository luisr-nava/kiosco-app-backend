import { kioscoApi } from "@/lib/kioscoApi";

export const deletePaymentMethodAction = async (id: string): Promise<void> => {
  await kioscoApi.delete(`/payment-method/${id}`);
};
