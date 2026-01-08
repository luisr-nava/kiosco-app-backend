import { kioscoApi } from "@/lib/kioscoApi";
import { CreateSaleDto, Sale } from "../interfaces";

export const CreateSale = async (
  payload: Partial<CreateSaleDto>
): Promise<Sale> => {
  const { data } = await kioscoApi.post("/sale", payload);
  return data;
};
