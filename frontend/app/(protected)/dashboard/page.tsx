"use client";

import { useShopStore } from "@/features/shop/shop.store";
import { SelectShopCard } from "../components";
import { useDashboardPage } from "@/features/dashboard/hooks/useDashboardPage";
import { Analytics, Financial, Stats } from "@/features/dashboard/components";

export default function Dashboard() {
  const { activeShopId } = useDashboardPage();

  if (!activeShopId) return <SelectShopCard />;

  return (
    <>
      <Financial activeShop={activeShopId!} />
      <Stats activeShop={activeShopId!} />
      <Analytics />
    </>
  );
}

