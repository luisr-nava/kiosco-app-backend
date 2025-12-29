"use client";

import { useShopStore } from "@/app/(private)/store/shops.slice";
import { Loading, SelectShopCard } from "../components";
import { Analytics, Financial, Stats } from "./components";
import { useAnalitycs } from "./hooks/useAnalitycs";

export default function Dashboard() {
  const { activeShop, activeShopId, activeShopLoading } = useShopStore();
  const { analytics, analyticsLoading, refetch } = useAnalitycs();

  const isLoadingShop = Boolean(activeShopId) && activeShopLoading;

  if (!activeShopId) return <SelectShopCard />;

  if (isLoadingShop) return <Loading />;

  return (
    <>
      <Financial activeShop={activeShop!} />
      <Stats activeShop={activeShop!} />
      <Analytics analytics={analytics!} analyticsLoading={analyticsLoading} />
      {/* <DashboardAnalyticsSection /> */}
    </>
  );
}

