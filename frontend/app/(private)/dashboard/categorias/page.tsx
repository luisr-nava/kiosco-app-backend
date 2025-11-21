"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import { categoryApi } from "@/lib/api/category.api";
import type {
  Category,
  CategoryType,
  CreateCategoryDto,
} from "@/lib/types/category";
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
import { FolderTree, Package, Truck } from "lucide-react";

const normalizeCategories = (value: Category[] | { data: Category[] } | undefined) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.data ?? [];
};

export default function CategoriasPage() {
  const { activeShopId, activeShopLoading } = useShopStore();
  const queryClient = useQueryClient();
  const [productForm, setProductForm] = useState({ name: "", description: "" });
  const [supplierForm, setSupplierForm] = useState({ name: "", description: "" });

  const {
    data: productCategories,
    isLoading: productCategoriesLoading,
  } = useQuery({
    queryKey: ["categories", activeShopId, "product"],
    queryFn: () => categoryApi.listByShop(activeShopId || "", "product"),
    enabled: Boolean(activeShopId),
    staleTime: 1000 * 30,
  });

  const {
    data: supplierCategories,
    isLoading: supplierCategoriesLoading,
  } = useQuery({
    queryKey: ["categories", activeShopId, "supplier"],
    queryFn: () => categoryApi.listByShop(activeShopId || "", "supplier"),
    enabled: Boolean(activeShopId),
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCategoryDto) => categoryApi.create(payload),
    onSuccess: (_response, variables) => {
      toast.success("Categoría creada");
      queryClient.invalidateQueries({
        queryKey: ["categories", activeShopId, variables.type],
      });
      if (variables.type === "product") {
        setProductForm({ name: "", description: "" });
      } else {
        setSupplierForm({ name: "", description: "" });
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "No se pudo crear la categoría";
      toast.error("Error", { description: message });
    },
  });

  const productList = useMemo(
    () => normalizeCategories(productCategories),
    [productCategories],
  );
  const supplierList = useMemo(
    () => normalizeCategories(supplierCategories),
    [supplierCategories],
  );

  const canCreateProduct =
    Boolean(activeShopId) && productForm.name.trim().length >= 3;
  const canCreateSupplier =
    Boolean(activeShopId) && supplierForm.name.trim().length >= 3;

  const handleCreate = (type: CategoryType) => {
    const payloadBase =
      type === "product" ? productForm : supplierForm;
    if (!activeShopId) return;

    createMutation.mutate({
      ...payloadBase,
      description: payloadBase.description || undefined,
      shopId: activeShopId,
      type,
    });
  };

  if (!activeShopId) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Categorías</h1>
        <p className="text-muted-foreground">
          Selecciona una tienda para ver y crear categorías.
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
          <FolderTree className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Categorías</h1>
          <p className="text-muted-foreground">
            Organiza tus productos y proveedores con categorías separadas.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
          <CardDescription>Categorías para organizar tu catálogo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-1">
              <Label>Nombre *</Label>
              <Input
                value={productForm.name}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Lácteos"
              />
            </div>
            <div className="grid gap-1">
              <Label>Descripción</Label>
              <Input
                value={productForm.description}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Opcional"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => handleCreate("product")}
              disabled={!canCreateProduct || createMutation.isPending}
            >
              {createMutation.isPending ? "Creando..." : "Crear categoría"}
            </Button>
          </div>

          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-5 w-5 text-primary" />
              <p className="font-semibold">Listado de categorías</p>
            </div>
            <Separator className="my-3" />
            {productCategoriesLoading ? (
              <p className="text-sm text-muted-foreground">Cargando categorías...</p>
            ) : productList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no tienes categorías para productos.
              </p>
            ) : (
              <ul className="space-y-2">
                {productList.map((category) => (
                  <li
                    key={category.id}
                    className="rounded-md border bg-background px-3 py-2"
                  >
                    <p className="font-medium">{category.name}</p>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proveedores</CardTitle>
          <CardDescription>
            Clasifica tus proveedores por rubro o tipo de servicio.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-1">
              <Label>Nombre *</Label>
              <Input
                value={supplierForm.name}
                onChange={(e) =>
                  setSupplierForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Distribuidores"
              />
            </div>
            <div className="grid gap-1">
              <Label>Descripción</Label>
              <Input
                value={supplierForm.description}
                onChange={(e) =>
                  setSupplierForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Opcional"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => handleCreate("supplier")}
              disabled={!canCreateSupplier || createMutation.isPending}
            >
              {createMutation.isPending ? "Creando..." : "Crear categoría"}
            </Button>
          </div>

          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="h-5 w-5 text-primary" />
              <p className="font-semibold">Listado de categorías</p>
            </div>
            <Separator className="my-3" />
            {supplierCategoriesLoading ? (
              <p className="text-sm text-muted-foreground">Cargando categorías...</p>
            ) : supplierList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no tienes categorías para proveedores.
              </p>
            ) : (
              <ul className="space-y-2">
                {supplierList.map((category) => (
                  <li
                    key={category.id}
                    className="rounded-md border bg-background px-3 py-2"
                  >
                    <p className="font-medium">{category.name}</p>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
