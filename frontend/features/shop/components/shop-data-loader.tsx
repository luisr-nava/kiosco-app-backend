"use client";

import { useEffect } from "react";
import { useShopStore } from "../shop.store";
import { useShopQuery } from "../hooks/useShopQuery";

export function ShopDataLoader({ children }: { children: React.ReactNode }) {
  const { shops, shopsLoading } = useShopQuery();
  const { setShops, activeShopId, setShouldForceStoreSelection } =
    useShopStore();

  useEffect(() => {
    if (shopsLoading) return;

    setShops(shops);
  }, [shops, shopsLoading, setShops]);

  return <>{children}</>;
}

