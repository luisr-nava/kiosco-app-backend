import { create } from "zustand";
import { ShopState } from "./types";
import { createJSONStorage, persist } from "zustand/middleware";

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      activeShopId: null,
      shouldForceStoreSelection: true,
      // Actions
      setActiveShopId: (shopId) => set({ activeShopId: shopId }),
      setShouldForceStoreSelection: (force) => set({ shouldForceStoreSelection: force }),
    }),
    {
      name: "shop-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeShopId: state.activeShopId,
      }),
    }
  )
);
