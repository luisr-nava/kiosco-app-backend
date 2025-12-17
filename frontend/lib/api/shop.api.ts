import type { Shop, CreateShopDto, UpdateShopDto, ShopDetail } from "@/lib/types/shop";
import { kioscoApi } from "@/lib/kioscoApi";
import { unwrapResponse } from "./utils";

const SHOP_BASE_PATH = "/shop";

export const shopApi = {
  // Obtener todas las tiendas del usuario
  getMyShops: async (): Promise<Shop[]> => {
    const { data } = await kioscoApi.get<Shop[] | { data: Shop[] }>(
      `${SHOP_BASE_PATH}/my-shops`,
    );
    return unwrapResponse(data);
  },

  // Crear una nueva tienda
  createShop: async (data: CreateShopDto): Promise<Shop> => {
    const { data: response } = await kioscoApi.post<Shop | { data: Shop }>(
      SHOP_BASE_PATH,
      data,
    );
    return unwrapResponse(response);
  },

  // Obtener tienda por ID
  getShopById: async (id: string): Promise<ShopDetail> => {
    const { data } = await kioscoApi.get<ShopDetail | { data: ShopDetail }>(
      `${SHOP_BASE_PATH}/${id}`,
    );
    return unwrapResponse(data);
  },

  // Actualizar tienda
  updateShop: async (id: string, data: UpdateShopDto): Promise<Shop> => {
    const { data: response } = await kioscoApi.patch<Shop | { data: Shop }>(
      `${SHOP_BASE_PATH}/${id}`,
      data,
    );
    return unwrapResponse(response);
  },

  // Toggle active/inactive
  toggleShop: async (id: string): Promise<Shop> => {
    const { data } = await kioscoApi.patch<Shop | { data: Shop }>(
      `${SHOP_BASE_PATH}/${id}/toggle`,
      {},
    );
    return unwrapResponse(data);
  },
};
