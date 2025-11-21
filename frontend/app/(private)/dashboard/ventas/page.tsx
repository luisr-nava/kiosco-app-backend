"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import { saleApi } from "@/lib/api/sale.api";
import { productApi } from "@/lib/api/product.api";
import type { CreateSaleDto, Sale, SaleItem } from "@/lib/types/sale";
import type { Product } from "@/lib/types/product";
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
import { ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";

const normalize = <T,>(value: T[] | { data: T[] } | undefined): T[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.data ?? [];
};

export default function VentasPage() {
  const { activeShopId, activeShopLoading } = useShopStore();
  const queryClient = useQueryClient();

  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const { data: salesResponse, isLoading: salesLoading } = useQuery({
    queryKey: ["sales", activeShopId],
    queryFn: () => saleApi.listByShop(activeShopId || ""),
    enabled: Boolean(activeShopId),
    staleTime: 1000 * 30,
  });

  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ["products", activeShopId, "for-sales"],
    queryFn: () =>
      productApi.listByShop(activeShopId || "", {
        limit: 100,
      }),
    enabled: Boolean(activeShopId),
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateSaleDto) => saleApi.create(payload),
    onSuccess: () => {
      toast.success("Venta registrada");
      queryClient.invalidateQueries({ queryKey: ["sales", activeShopId] });
      setNotes("");
      setItems([]);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "No se pudo registrar la venta";
      toast.error("Error", { description: message });
    },
  });

  const sales = useMemo(() => normalize<Sale>(salesResponse), [salesResponse]);
  const products = useMemo(
    () => normalize<Product>(productsResponse),
    [productsResponse],
  );

  const total = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + Number(item.subtotal || 0),
        0,
      ),
    [items],
  );

  const incrementProduct = (productId: string) => {
    const selected = products.find((p) => (p as any).id === productId);
    const stock = Number((selected as any)?.stock ?? 0);
    if (!selected || stock <= 0) {
      toast.error("Producto sin stock disponible");
      return;
    }
    setItems((prev) => {
      const idx = prev.findIndex((item) => item.shopProductId === productId);
      if (idx >= 0) {
        const next = [...prev];
        const current = next[idx];
        const quantity = Number(current.quantity) + 1;
        const unitPrice = current.unitPrice || selected.salePrice || 0;
        next[idx] = {
          ...current,
          quantity,
          unitPrice,
          subtotal: quantity * unitPrice,
        };
        return next;
      }
      const unitPrice = selected.salePrice ?? 0;
      return [
        ...prev,
        {
          shopProductId: productId,
          unitPrice,
          quantity: 1,
          subtotal: unitPrice,
        },
      ];
    });
  };

  const decrementProduct = (productId: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((item) => item.shopProductId === productId);
      if (idx < 0) return prev;
      const next = [...prev];
      const current = next[idx];
      const quantity = Number(current.quantity) - 1;
      if (quantity <= 0) {
        next.splice(idx, 1);
        return next;
      }
      const unitPrice = current.unitPrice || 0;
      next[idx] = {
        ...current,
        quantity,
        subtotal: quantity * unitPrice,
      };
      return next;
    });
  };

  const handleSubmit = () => {
    if (!activeShopId) return;
    if (items.length === 0) {
      toast.error("Agrega al menos un producto al carrito");
      return;
    }
    const hasInvalid = items.some(
      (item) =>
        !item.shopProductId ||
        Number(item.quantity) <= 0 ||
        Number(item.unitPrice) <= 0,
    );
    if (hasInvalid) {
      toast.error("Completa los datos de cada ítem");
      return;
    }

    const payload: CreateSaleDto = {
      shopId: activeShopId,
      notes: notes || undefined,
      items: items.map((item) => ({
        shopProductId: item.shopProductId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
    };

    createMutation.mutate(payload);
  };

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + Number(item.quantity || 0), 0),
    [items],
  );

  if (!activeShopId) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Ventas</h1>
        <p className="text-muted-foreground">
          Selecciona una tienda para registrar y consultar ventas.
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
          <ShoppingCart className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Ventas</h1>
          <p className="text-muted-foreground">
            Punto de venta con ítems y detalle expandible por cada transacción.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>POS</CardTitle>
          <CardDescription>Registra una venta rápida con productos de la tienda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Notas (opcional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Cliente preferencial, pago efectivo, etc."
              />
            </div>
            <div className="flex items-end justify-end">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total estimado</p>
                <p className="text-2xl font-semibold">${total.toLocaleString("es-AR")}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-semibold">Productos</h3>
                <p className="text-sm text-muted-foreground">
                  Usa los botones para sumar o quitar productos al carrito.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">En carrito</p>
                <p className="text-sm font-semibold">
                  {totalItems} {totalItems === 1 ? "ítem" : "ítems"}
                </p>
              </div>
            </div>
            {productsLoading ? (
              <p className="text-sm text-muted-foreground">Cargando productos...</p>
            ) : products.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay productos cargados.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <div
                    key={(product as any).id}
                    className="rounded-lg border bg-muted/40 p-3 text-left transition hover:border-primary"
                  >
                    {Number((product as any).stock ?? 0) <= 0 && (
                      <span className="mb-2 inline-flex rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                        Sin stock
                      </span>
                    )}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-primary block">
                          ${product.salePrice}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Stock: {product.stock ?? 0}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={Number((product as any).stock ?? 0) <= 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            decrementProduct((product as any).id);
                          }}
                        >
                          −
                        </Button>
                        <span className="text-sm font-semibold">
                          {
                            items.find((i) => i.shopProductId === (product as any).id)
                              ?.quantity ?? 0
                          }
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          disabled={Number((product as any).stock ?? 0) <= 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            incrementProduct((product as any).id);
                          }}
                        >
                          +
                        </Button>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Subtotal: $
                        {(
                          (items.find((i) => i.shopProductId === (product as any).id)
                            ?.subtotal ?? 0) as number
                        ).toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || items.length === 0}
            >
              {createMutation.isPending ? "Guardando..." : "Registrar venta"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
          <CardDescription>Ventas registradas en esta tienda.</CardDescription>
        </CardHeader>
        <CardContent>
          {salesLoading ? (
            <p className="text-sm text-muted-foreground">Cargando ventas...</p>
          ) : sales.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no registraste ventas.
            </p>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <div className="grid grid-cols-4 bg-muted px-4 py-2 text-sm font-semibold">
                <span>Fecha</span>
                <span>Total</span>
                <span>Ítems</span>
                <span className="text-right">Detalle</span>
              </div>
              <div className="divide-y">
                {sales.map((sale) => {
                  const isOpen = expandedRow === sale.id;
                  return (
                    <div key={sale.id}>
                      <button
                        className="grid w-full grid-cols-4 items-center px-4 py-3 text-left hover:bg-muted/80"
                        onClick={() => setExpandedRow(isOpen ? null : sale.id)}
                      >
                        <span className="text-sm text-muted-foreground">
                          {sale.createdAt
                            ? new Date(sale.createdAt).toLocaleString()
                            : "Sin fecha"}
                        </span>
                        <span className="font-semibold">
                          ${sale.total?.toLocaleString("es-AR") ?? 0}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {sale.items?.length ?? 0} ítems
                        </span>
                        <span className="flex justify-end text-sm text-primary">
                          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="space-y-2 bg-muted/40 px-4 py-3 text-sm">
                          {sale.notes && (
                            <p className="text-muted-foreground">Notas: {sale.notes}</p>
                          )}
                          <div className="space-y-1">
                            {sale.items?.map((item, idx) => (
                              <div
                                key={item.id || idx}
                                className="rounded-md border bg-background px-3 py-2"
                              >
                                <p className="font-medium">
                                  {item.productName || item.shopProductId}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Cantidad: {item.quantity} · Precio: ${item.unitPrice} · Subtotal: ${item.subtotal}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
