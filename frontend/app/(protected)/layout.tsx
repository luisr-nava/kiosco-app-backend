"use client";
import { usePrivateRouteGuard } from "@/features/auth/hooks/usePrivateRouteGuard";
import { StoreSelector } from "@/features/shop/components/store-selector";
import { Loading } from "@/components/loading";
import { ShopDataLoader } from "@/features/shop/components/shop-data-loader";
import { useShopStore } from "@/features/shop/shop.store";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShopDataLoader>
      <PrivateLayoutContent>{children}</PrivateLayoutContent>
    </ShopDataLoader>
  );
}

function PrivateLayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoading } = usePrivateRouteGuard();
  const { activeShopId } = useShopStore();

  if (isLoading) {
    return <Loading text="Verificando autenticación..." />;
  }

  if (!activeShopId) {
    return <StoreSelector />;
  }
  return <>{children}</>;
}

