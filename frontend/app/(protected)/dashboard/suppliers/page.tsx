"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks";
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
import { AlertTriangle, ShieldAlert, Truck } from "lucide-react";
import { Supplier, CreateSupplierDto } from "@/lib/types/supplier";
import { SupplierForm, SupplierFormValues } from "./components/supplier-form";
import { SupplierTable } from "./components/supplier-table";
import { useSuppliers } from "./hooks/useSuppliers";
import { useSupplierMutations } from "./hooks/useSupplierMutations";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { ShopLoading } from "@/components/shop-loading";
import { useCategorySuppliersQuery } from "@/app/(protected)/settings/category/hooks";
import { useShopStore } from "@/features/shop/shop.store";

export default function ProveedoresPage() {
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const { activeShopId, shops } = useShopStore();

  const { suppliers, isLoading, isFetching } = useSuppliers();
  const { createMutation, updateMutation, deleteMutation } =
    useSupplierMutations();
  const {
    categorySuppliers,
    categorySuppliersLoading,
    fetchNextSupplierCategories,
    hasMoreSupplierCategories,
  } = useCategorySuppliersQuery();

  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [search, setSearch] = useState("");

  const deletingId = useMemo(
    () => (deleteMutation.variables as string | undefined) ?? null,
    [deleteMutation.variables],
  );

  const filteredSuppliers = useMemo(() => {
    if (!search.trim()) return suppliers;
    const term = search.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        (s.contactName || "").toLowerCase().includes(term) ||
        (s.email || "").toLowerCase().includes(term),
    );
  }, [search, suppliers]);

  const handleSubmit = (values: SupplierFormValues) => {
    if (!activeShopId) {
      toast.error("Selecciona una tienda para gestionar proveedores.");
      return;
    }

    const payload: CreateSupplierDto = {
      name: values.name,
      contactName: values.contactName || null,
      phone: values.phone || null,
      email: values.email || null,
      address: values.address || null,
      notes: values.notes || null,
      categoryId: values.categoryId || null,
      shopIds:
        isOwner && values.shopIds.length
          ? values.shopIds
          : activeShopId
          ? [activeShopId]
          : [],
    };

    if (editingSupplier) {
      updateMutation.mutate(
        { id: editingSupplier.id, payload },
        {
          onSuccess: () => {
            setEditingSupplier(null);
            setIsModalOpen(false);
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setEditingSupplier(null);
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleDelete = (supplier: Supplier) => {
    setDeleteTarget(supplier);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        if (editingSupplier?.id === deleteTarget.id) {
          setEditingSupplier(null);
        }
        setDeleteTarget(null);
      },
    });
  };

  const handleCancelEdit = () => {
    setEditingSupplier(null);
    setIsModalOpen(false);
  };

  if (!isOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Acceso restringido
          </CardTitle>
          <CardDescription>
            Esta sección solo está disponible para propietarios de la cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Consulta con el owner del proyecto para obtener permisos.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!activeShopId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Selecciona una tienda</CardTitle>
          <CardDescription>
            Debes elegir una tienda activa para gestionar los proveedores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Abre el selector de tiendas para continuar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">
              Buscar
            </Label>
            <Input
              className="w-full sm:w-64"
              placeholder="Nombre o email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              setEditingSupplier(null);
              setIsModalOpen(true);
            }}>
            Nuevo proveedor
          </Button>
        </div>
        <div className="rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
          <Truck className="h-4 w-4" />
          <div className="text-right leading-tight">
            <p className="font-medium">{"Tienda activa"}</p>
            <p>Proveedores: {suppliers.length}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          {isFetching && (
            <span className="flex items-center gap-1">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Actualizando
            </span>
          )}
          {(createMutation.isPending || updateMutation.isPending) && (
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              Guardando cambios
            </span>
          )}
        </div>
      </div>
      <SupplierTable
        suppliers={filteredSuppliers}
        isLoading={isLoading}
        isFetching={isFetching}
        onEdit={(supplier) => {
          setEditingSupplier(supplier);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
      {deleteMutation.isError && (
        <p className="mt-3 text-xs text-destructive">
          No se pudo eliminar el proveedor, intenta nuevamente.
        </p>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelEdit}
        title={editingSupplier ? "Editar proveedor" : "Nuevo proveedor"}
        description={`Tienda: `}>
        <SupplierForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          editingSupplier={editingSupplier}
          onCancelEdit={handleCancelEdit}
          shops={shops}
          isOwner={isOwner}
          activeShopId={activeShopId}
          categories={categorySuppliers}
          loadMoreCategories={fetchNextSupplierCategories}
          hasMoreCategories={hasMoreSupplierCategories}
          isLoadingCategories={categorySuppliersLoading}
        />
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar proveedor"
        description="Esta acción es permanente y no podrás recuperar el registro.">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            ¿Seguro que deseas eliminar a{" "}
            <span className="font-semibold">{deleteTarget?.name}</span>? Esta
            acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}>
              {deleteMutation.isPending
                ? "Eliminando..."
                : "Eliminar definitivamente"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

