"use client";

import { useAuth } from "@/app/(auth)/hooks";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  const { user } = useAuth();
  const { activeShop, activeShopId, activeShopLoading } = useShopStore();

  const stats = [
    { label: "Empleados", value: activeShop?.employeesCount ?? 0 },
    { label: "Productos", value: activeShop?.productsCount ?? 0 },
    { label: "Categorías", value: activeShop?.categoriesCount ?? 0 },
    { label: "Proveedores", value: activeShop?.suppliersCount ?? 0 },
    { label: "Compras", value: activeShop?.purchasesCount ?? 0 },
    { label: "Ventas", value: activeShop?.salesCount ?? 0 },
  ];

  const financial = [
    { label: "Total ventas", value: activeShop?.totalSales ?? 0 },
    { label: "Total gastos", value: activeShop?.totalExpenses ?? 0 },
    { label: "Total ingresos", value: activeShop?.totalIncomes ?? 0 },
    { label: "Balance", value: activeShop?.balance ?? 0 },
  ];

  const isLoadingShop = Boolean(activeShopId) && activeShopLoading;

  if (!activeShopId) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Selecciona una tienda para ver sus métricas.
        </p>
      </div>
    );
  }

  if (isLoadingShop) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-muted-foreground">Cargando datos de la tienda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de {activeShop?.name} — {user?.fullName}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tienda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-lg font-semibold">{activeShop?.name}</p>
            <p className="text-sm text-muted-foreground">
              {activeShop?.address || "Sin dirección"}
            </p>
            <p className="text-sm text-muted-foreground">
              {activeShop?.phone || "Sin teléfono"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p
              className={`text-lg font-semibold ${
                activeShop?.isActive ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {activeShop?.isActive ? "Activa" : "Inactiva"}
            </p>
            <p className="text-sm text-muted-foreground">
              ID: {activeShop?.id}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fechas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>Creada: {new Date(activeShop?.createdAt || "").toLocaleString()}</p>
            <p>
              Actualizada:{" "}
              {new Date(activeShop?.updatedAt || "").toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Finanzas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {financial.map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-semibold">
                  ${item.value?.toLocaleString("es-AR") ?? 0}
                </p>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="text-sm text-muted-foreground">
            Transacciones: ventas {activeShop?.salesTransactions ?? 0} ·
            ingresos {activeShop?.incomesTransactions ?? 0} · gastos{" "}
            {activeShop?.expensesTransactions ?? 0}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
