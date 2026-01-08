import { kioscoApi } from "@/lib/kioscoApi";
import { CashRegisterStateResponse } from "../type";

export const getCashRegisterStateAction = async (
  shopId: string
): Promise<CashRegisterStateResponse> => {
  const { data } = await kioscoApi.get<CashRegisterStateResponse>(
    "/cash-register/state",
    {
      params: { shopId },
    }
  );

  return data;
};
