"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShopEmpty } from "@/components/shop-emty";
import { ShopLoading } from "@/components/shop-loading";
import { useShopStore } from "@/app/(private)/store/shops.slice";

export default function SalesHistoryPage() {
  const { activeShopId, activeShopLoading } = useShopStore();

  if (!activeShopId) return <ShopEmpty />;
  if (activeShopLoading) return <ShopLoading />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Ventas</CardTitle>
          <CardDescription>
            Consulta el historial y detalles de las ventas realizadas en la tienda activa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Próximamente: listado, filtros y detalles de ventas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
