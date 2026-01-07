import { kioscoApi } from "@/lib/kioscoApi";
import { ShopFormValues, Shop } from "../types";

export const createShopAction = async (data: ShopFormValues): Promise<Shop> => {
  const { data: shopData } = await kioscoApi.post<Shop>("/shop", data);
  return shopData;
};
