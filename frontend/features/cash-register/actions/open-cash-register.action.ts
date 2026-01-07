import { kioscoApi } from "@/lib/kioscoApi";
import { CashRegisterStateResponse, OpenCashRegisterDto } from "../type";

export const openCashRegisterAction = async (payload: OpenCashRegisterDto) => {
  const { data } = await kioscoApi.post<CashRegisterStateResponse>("/cash-register/open", payload);
  console.log(data);

  return data;
};
