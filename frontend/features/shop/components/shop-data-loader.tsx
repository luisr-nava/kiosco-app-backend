"use client";

import { useEffect } from "react";
import { useShopStore } from "../shop.store";
import { useShopQuery } from "../hooks/useShopQuery";

export function ShopDataLoader({ children }: { children: React.ReactNode }) {
  useShopQuery();

  return <>{children}</>;
}
