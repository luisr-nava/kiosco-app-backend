import { create } from "zustand";
import { ShopDetail, ShopState } from "./types";
import { createJSONStorage, persist } from "zustand/middleware";

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      shops: [],
      activeShopId: null,
      shouldForceStoreSelection: true,
      // Actions
      setShops: (shops) => set({ shops }),
      setActiveShopId: (shopId) => set({ activeShopId: shopId }),
      setShouldForceStoreSelection: (force) =>
        set({ shouldForceStoreSelection: force }),
      clearShops: () =>
        set({
          shops: [],
          activeShopId: null,
          shouldForceStoreSelection: true,
        }),
    }),
    {
      name: "shop-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        shops: state.shops,
        activeShopId: state.activeShopId,
      }),
    },
  ),
);

