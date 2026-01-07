"use client";

import { useShopStore } from "@/features/shop/shop.store";
import { Analytics, Financial, Stats } from "@/features/dashboard/components";
import { SelectShopCard } from "@/components/select-shop-card";

export default function Dashboard() {
  const { activeShopId } = useShopStore();

  if (!activeShopId) return <SelectShopCard />;

  return (
    <>
      <Financial />
      <Stats />
      <Analytics />
    </>
  );
}
