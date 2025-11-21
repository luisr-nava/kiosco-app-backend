"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import { productApi } from "@/lib/api/product.api";
import type { CreateProductDto, Product } from "@/lib/types/product";
import { supplierApi } from "@/lib/api/supplier.api";
import type { Supplier } from "@/lib/types/supplier";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const initialForm: CreateProductDto = {
  name: "",
  description: "",
  barcode: "",
  shopId: "",
  costPrice: 0,
  salePrice: 0,
  stock: 0,
  supplierId: "",
};

export default function ProductosPage() {
  const { activeShopId, activeShopLoading } = useShopStore();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateProductDto>(initialForm);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const searchParam = searchParams.get("search") ?? "";
  const pageParam = Number(searchParams.get("page") ?? "1");
  const limitParam = Number(searchParams.get("limit") ?? "10");

  const [search, setSearch] = useState(searchParam);
  const [page, setPage] = useState(Number.isNaN(pageParam) ? 1 : pageParam);
  const [limit, setLimit] = useState(
    Number.isNaN(limitParam) ? 10 : limitParam,
  );

  const updateQueryParams = (next: {
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.search !== undefined) params.set("search", next.search);
    if (next.page !== undefined) params.set("page", String(next.page));
    if (next.limit !== undefined) params.set("limit", String(next.limit));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ["products", activeShopId, search, page, limit],
    queryFn: () =>
      productApi.listByShop(activeShopId || "", {
        search,
        page,
        limit,
      }),
    enabled: Boolean(activeShopId),
    staleTime: 1000 * 30,
  });

  const { data: suppliersResponse, isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers", activeShopId, "for-products"],
    queryFn: () => supplierApi.listByShop(activeShopId || ""),
    enabled: Boolean(activeShopId),
    staleTime: 1000 * 30,
  });

  const suppliers = useMemo<Supplier[]>(() => {
    const value = suppliersResponse as any;
    if (!value) return [];
    if (Array.isArray(value)) return value as Supplier[];
    return (value.data as Supplier[]) ?? [];
  }, [suppliersResponse]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateProductDto) => productApi.create(payload),
    onSuccess: () => {
      toast.success("Producto creado");
      queryClient.invalidateQueries({ queryKey: ["products", activeShopId] });
      setOpen(false);
      setForm((prev) => ({ ...prev, name: "", description: "", barcode: "", costPrice: 0, salePrice: 0, stock: 0, supplierId: "" }));
      setEditingId(null);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "No se pudo crear el producto";
      toast.error("Error", { description: message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateProductDto }) =>
      productApi.update(id, payload),
    onSuccess: () => {
      toast.success("Producto actualizado");
      queryClient.invalidateQueries({ queryKey: ["products", activeShopId] });
      setOpen(false);
      setEditingId(null);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "No se pudo actualizar el producto";
      toast.error("Error", { description: message });
    },
  });

  useEffect(() => {
    if (activeShopId) {
      setForm((prev) => ({ ...prev, shopId: activeShopId }));
    }
  }, [activeShopId]);

  useEffect(() => {
    setSearch(searchParam);
    setPage(Number.isNaN(pageParam) ? 1 : pageParam);
    setLimit(Number.isNaN(limitParam) ? 10 : limitParam);
  }, [searchParam, pageParam, limitParam]);

  const canSubmit = useMemo(() => {
    return Boolean(form.name.trim() && form.shopId && form.salePrice > 0);
  }, [form.name, form.shopId, form.salePrice]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm((prev) => ({
      ...initialForm,
      shopId: activeShopId || prev.shopId,
    }));
    setOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      barcode: product.barcode || "",
      shopId: product.shopId,
      costPrice: product.costPrice ?? 0,
      salePrice: product.salePrice ?? 0,
      stock: product.stock ?? 0,
      supplierId: product.supplierId || "",
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const payload = {
      ...form,
      supplierId: form.supplierId || undefined,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const products =
    (productsResponse as any)?.data ??
    (Array.isArray(productsResponse) ? productsResponse : []);

  if (!activeShopId) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Productos</h1>
        <p className="text-muted-foreground">Selecciona una tienda para ver y crear productos.</p>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground">Listado de productos de la tienda seleccionada.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">Buscar</Label>
            <Input
              className="w-48"
              placeholder="Nombre"
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                setSearch(value);
                updateQueryParams({ search: value, page: 1 });
              }}
            />
          </div>
          <Button onClick={handleOpenCreate}>Nuevo producto</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                <p className="text-muted-foreground">Cargando productos...</p>
              </div>
            </div>
          ) : !products || products.length === 0 ? (
            <div className="text-muted-foreground text-sm">No hay productos cargados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b">
                    <th className="py-2 pr-4">Nombre</th>
                    <th className="py-2 pr-4">Código</th>
                    <th className="py-2 pr-4">Stock</th>
                    <th className="py-2 pr-4">Precio venta</th>
                    <th className="py-2 pr-4">Proveedor</th>
                    <th className="py-2 pr-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{product.name}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{product.barcode || "—"}</td>
                      <td className="py-2 pr-4">{product.stock}</td>
                      <td className="py-2 pr-4">${product.salePrice.toLocaleString("es-AR")}</td>
                      <td className="py-2 pr-4 text-muted-foreground">
                        {product.supplierId || "Sin proveedor"}
                      </td>
                      <td className="py-2 pr-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(product)}
                        >
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">Límite</Label>
                    <select
                      className="w-24 rounded-md border border-input bg-background px-2 py-1 text-sm"
                      value={limit}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setLimit(value);
                        updateQueryParams({ limit: value, page: 1 });
                      }}
                    >
                      {[10, 50, 100].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const next = Math.max(1, page - 1);
                        setPage(next);
                        updateQueryParams({ page: next });
                      }}
                      disabled={page <= 1}
                    >
                      ← Prev
                    </Button>
                    <span>
                      Página {page}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // sin meta de total de páginas, solo avanzamos mientras haya resultados actuales; si llega vacío el backend debería responder vacío y se puede retroceder
                        const next = page + 1;
                        setPage(next);
                        updateQueryParams({ page: next });
                      }}
                      disabled={!products || products.length < limit}
                    >
                      Next →
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-semibold">
                {editingId ? "Editar producto" : "Crear producto"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  setEditingId(null);
                }}
              >
                Cerrar
              </Button>
            </div>
            <div className="p-6 space-y-3">
              <div className="grid gap-1">
                <Label>Nombre *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jabón"
                />
              </div>
              <div className="grid gap-1">
                <Label>Descripción</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div className="grid gap-1">
                <Label>Código de barras</Label>
                <Input
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  placeholder="EAN/UPC"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1">
                  <Label>Precio costo</Label>
                  <Input
                    type="number"
                    value={form.costPrice}
                    onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-1">
                  <Label>Precio venta *</Label>
                  <Input
                    type="number"
                    value={form.salePrice}
                    onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-1">
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid gap-1">
                <Label>Proveedor (opcional)</Label>
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={form.supplierId || ""}
                  onChange={(e) =>
                    setForm({ ...form, supplierId: e.target.value || undefined })
                  }
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
              <div className="pt-2">
                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={
                    !canSubmit ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Guardando..."
                    : editingId
                      ? "Actualizar producto"
                      : "Crear producto"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
