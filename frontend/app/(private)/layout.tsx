"use client";

import { PrivateRouteGuard } from "@/components/guards/private-route-guard";
import { StoreSetupGuard } from "@/components/guards/store-setup-guard";
import { SessionDataLoader } from "@/components/shops/session-data-loader";
import { useNotificationsQuery } from "@/app/(private)/hooks/useNotificationsQuery";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useNotificationsQuery();

  return (
    <PrivateRouteGuard>
      <StoreSetupGuard>
        <SessionDataLoader />
        {children}
      </StoreSetupGuard>
    </PrivateRouteGuard>
  );
}
