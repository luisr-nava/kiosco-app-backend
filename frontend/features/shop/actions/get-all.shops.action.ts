import { kioscoApi } from "@/lib/kioscoApi";
import { Shop, ShopResponse } from "../types";

export const getAllShops = async (): Promise<Shop[]> => {
  const { data } = await kioscoApi.get<ShopResponse>(`/shop/my-shops`);

  return data.data;
};

