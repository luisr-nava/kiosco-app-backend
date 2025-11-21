"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import { purchaseApi } from "@/lib/api/purchase.api";
import { productApi } from "@/lib/api/product.api";
import { supplierApi } from "@/lib/api/supplier.api";
import type { CreatePurchaseDto, Purchase, PurchaseItem } from "@/lib/types/purchase";
import type { Product } from "@/lib/types/product";
import type { Supplier } from "@/lib/types/supplier";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Receipt } from "lucide-react";

const normalize = <T,>(value: T[] | { data: T[] } | undefined): T[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.data ?? [];
};

const buildItem = (): PurchaseItem => ({
  shopProductId: "",
  quantity: 1,
  unitCost: 0,
  subtotal: 0,
  includesTax: true,
});

export default function ComprasPage() {
  const { activeShopId, activeShopLoading } = useShopStore();
  const queryClient = useQueryClient();

  const [notes, setNotes] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([buildItem()]);

  const { data: purchasesResponse, isLoading: purchasesLoading } = useQuery({
    queryKey: ["purchases", activeShopId],
    queryFn: () => purchaseApi.listByShop(activeShopId || ""),
    enabled: Boolean(activeShopId),
    staleTime: 1000 * 30,
  });

  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ["products", activeShopId, "for-purchases"],
    queryFn: () =>
      productApi.listByShop(activeShopId || "", {
        limit: 100,
      }),
    enabled: Boolean(activeShopId),
    staleTime: 1000 * 30,
  });

  const { data: suppliersResponse, isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers", activeShopId, "for-purchases"],
    queryFn: () => supplierApi.listByShop(activeShopId || ""),
    enabled: Boolean(activeShopId),
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreatePurchaseDto) => purchaseApi.create(payload),
    onSuccess: () => {
      toast.success("Compra registrada");
      queryClient.invalidateQueries({ queryKey: ["purchases", activeShopId] });
      setNotes("");
      setSupplierId("");
      setItems([buildItem()]);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "No se pudo registrar la compra";
      toast.error("Error", { description: message });
    },
  });

  const purchases = useMemo(
    () => normalize<Purchase>(purchasesResponse),
    [purchasesResponse],
  );

  const products = useMemo(
    () => normalize<Product>(productsResponse),
    [productsResponse],
  );
  const suppliers = useMemo(
    () => normalize<Supplier>(suppliersResponse),
    [suppliersResponse],
  );

  const total = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + Number(item.subtotal || 0),
        0,
      ),
    [items],
  );

  const updateItem = (index: number, next: Partial<PurchaseItem>) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const merged = { ...item, ...next };
        const subtotal = Number(merged.quantity || 0) * Number(merged.unitCost || 0);
        return { ...merged, subtotal };
      }),
    );
  };

  const addItem = () => setItems((prev) => [...prev, buildItem()]);
  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = () => {
    if (!activeShopId) return;
    const hasInvalid = items.some(
      (item) =>
        !item.shopProductId ||
        Number(item.quantity) <= 0 ||
        Number(item.unitCost) <= 0,
    );
    if (hasInvalid) {
      toast.error("Completa los datos de cada ítem");
      return;
    }

    const payload: CreatePurchaseDto = {
      shopId: activeShopId,
      supplierId: supplierId || undefined,
      notes: notes || undefined,
      items: items.map((item) => ({
        shopProductId: item.shopProductId,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
        subtotal: Number(item.subtotal),
        includesTax: Boolean(item.includesTax),
      })),
    };

    createMutation.mutate(payload);
  };

  if (!activeShopId) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Compras</h1>
        <p className="text-muted-foreground">
          Selecciona una tienda para ver y registrar compras.
        </p>
      </div>
    );
  }

  if (activeShopLoading) {
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
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-3">
          <Receipt className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Compras</h1>
          <p className="text-muted-foreground">
            Registra compras de productos y lleva el historial por tienda.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nueva compra</CardTitle>
          <CardDescription>Completa los datos de la compra y sus ítems.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Proveedor (opcional)</Label>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                disabled={suppliersLoading}
              >
                <option value="">Sin proveedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label>Notas</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Compra quincenal de mercadería"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Ítems de la compra</h3>
              <Button variant="outline" size="sm" onClick={addItem}>
                Agregar ítem
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid gap-2 rounded-md border bg-muted/40 p-3 md:grid-cols-6 md:items-end"
                >
                  <div className="grid gap-1 md:col-span-2">
                    <Label>Producto *</Label>
                    <select
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                      value={item.shopProductId}
                      onChange={(e) => {
                        const value = e.target.value;
                        const selected = products.find((p) => (p as any).id === value);
                        updateItem(index, {
                          shopProductId: value,
                          unitCost: selected?.costPrice ?? item.unitCost,
                        });
                      }}
                      disabled={productsLoading}
                    >
                      <option value="">Seleccionar producto</option>
                      {products.map((product) => (
                        <option key={(product as any).id} value={(product as any).id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-1">
                    <Label>Cantidad *</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      min={0}
                      onChange={(e) =>
                        updateItem(index, { quantity: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label>Costo unitario *</Label>
                    <Input
                      type="number"
                      value={item.unitCost}
                      min={0}
                      onChange={(e) =>
                        updateItem(index, { unitCost: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label>Subtotal</Label>
                    <Input value={item.subtotal} readOnly />
                  </div>

                  <div className="grid gap-1">
                    <Label>Impuesto incluido</Label>
                    <select
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                      value={item.includesTax ? "yes" : "no"}
                      onChange={(e) =>
                        updateItem(index, { includesTax: e.target.value === "yes" })
                      }
                    >
                      <option value="yes">Sí</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end md:justify-center">
                    {items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        Quitar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-md border bg-background px-4 py-3">
              <p className="text-sm text-muted-foreground">Total estimado</p>
              <p className="text-xl font-semibold">${total.toLocaleString("es-AR")}</p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || items.length === 0}
              >
                {createMutation.isPending ? "Guardando..." : "Registrar compra"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
          <CardDescription>Compras registradas en esta tienda.</CardDescription>
        </CardHeader>
        <CardContent>
          {purchasesLoading ? (
            <p className="text-sm text-muted-foreground">Cargando compras...</p>
          ) : purchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no registraste compras.
            </p>
          ) : (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="rounded-md border bg-muted/40 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-1">
                      <p className="font-semibold">
                        Total: ${purchase.total?.toLocaleString("es-AR") ?? 0}
                      </p>
                      {purchase.notes && (
                        <p className="text-sm text-muted-foreground">{purchase.notes}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {purchase.createdAt
                        ? new Date(purchase.createdAt).toLocaleString()
                        : "Sin fecha"}
                    </p>
                  </div>
                  <Separator className="my-2" />
                  <div className="text-sm text-muted-foreground">
                    {purchase.items?.length ?? 0} ítems ·{" "}
                    {purchase.supplierId ? `Proveedor: ${purchase.supplierId}` : "Sin proveedor"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
