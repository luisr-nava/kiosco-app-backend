import { useEffect, useMemo, useState } from "react";
import { useShopStore } from "../shop.store";
import { useShopQuery } from "./useShopQuery";

export const useShop = () => {
  const { shops, shopsLoading } = useShopQuery();
  const {
    setShops,
    activeShopId,
    setActiveShopId,
    setShouldForceStoreSelection,
  } = useShopStore();

  return {
    shops,
    shopsLoading,
    setShops,
    activeShopId,
    setActiveShopId,
    setShouldForceStoreSelection,
  };
};
