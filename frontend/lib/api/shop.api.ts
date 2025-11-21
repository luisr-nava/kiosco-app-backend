import type { Shop, CreateShopDto, UpdateShopDto, ShopDetail } from "@/lib/types/shop";
import { kioscoApi } from "@/lib/kioscoApi";

const SHOP_BASE_PATH = "/shop";

export const shopApi = {
  // Obtener todas las tiendas del usuario
  getMyShops: async (): Promise<Shop[]> => {
    const { data } = await kioscoApi.get(`${SHOP_BASE_PATH}/my-shops`);
    return (data as any)?.data ?? data;
  },

  // Crear una nueva tienda
  createShop: async (data: CreateShopDto): Promise<Shop> => {
    const { data: response } = await kioscoApi.post(SHOP_BASE_PATH, data);
    return (response as any)?.data ?? response;
  },

  // Obtener tienda por ID
  getShopById: async (id: string): Promise<ShopDetail> => {
    const { data } = await kioscoApi.get(`${SHOP_BASE_PATH}/${id}`);
    return (data as any)?.data ?? data;
  },

  // Actualizar tienda
  updateShop: async (id: string, data: UpdateShopDto): Promise<Shop> => {
    const { data: response } = await kioscoApi.patch(
      `${SHOP_BASE_PATH}/${id}`,
      data,
    );
    return (response as any)?.data ?? response;
  },

  // Toggle active/inactive
  toggleShop: async (id: string): Promise<Shop> => {
    const { data } = await kioscoApi.patch(
      `${SHOP_BASE_PATH}/${id}/toggle`,
      {},
    );
    return (data as any)?.data ?? data;
  },
};
