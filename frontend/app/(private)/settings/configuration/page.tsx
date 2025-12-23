"use client";

import { useShopStore } from "@/app/(private)/store/shops.slice";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { ShopLoading } from "@/components/shop-loading";
import { useShallow } from "zustand/react/shallow";
import { Package, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryForm, CategoryList } from "../category/components";
import { useCategory, useCategoryForm } from "../category/hooks";
import { PaymentMethodForm, PaymentMethodTable } from "../payment-method/components";
import { usePaymentMethodMutations, usePaymentMethods } from "../payment-method/hooks";
import type { PaymentMethod } from "../payment-method/interfaces";
import {
  MeasurementUnitForm,
  MeasurementUnitTable,
} from "../measurement-unit/components";
import {
  useMeasurementUnitMutations,
  useMeasurementUnits,
} from "../measurement-unit/hooks";
import type {
  MeasurementBaseUnit,
  MeasurementUnit,
  MeasurementUnitCategory,
} from "../measurement-unit/interfaces";

const BASE_UNIT_BY_CATEGORY: Record<
  MeasurementUnitCategory,
  MeasurementBaseUnit
> = {
  UNIT: "UNIT",
  WEIGHT: "KG",
  VOLUME: "L",
};

export default function ConfigurationPage() {
  const {
    categoryProducts,
    categoryProductsLoading,
    categorySuppliers,
    categorySuppliersLoading,
    fetchNextProductCategories,
    hasMoreProductCategories,
    isFetchingNextProductCategories,
    fetchNextSupplierCategories,
    hasMoreSupplierCategories,
    isFetchingNextSupplierCategories,
  } = useCategory();

  const {
    isOwner,
    shops,
    registerProduct,
    registerSupplier,
    onSubmitProduct,
    onSubmitSupplier,
    toggleShopSelection,
    handleEditProduct,
    handleEditSupplier,
    cancelProductEdit,
    cancelSupplierEdit,
    productShopIds,
    supplierShopIds,
    canCreateProduct,
    canCreateSupplier,
    editingProductId,
    editingSupplierId,
    productPending,
    supplierPending,
  } = useCategoryForm();

  const { activeShopLoading, activeShopId } = useShopStore(
    useShallow((state) => ({
      activeShopLoading: state.activeShopLoading,
      activeShopId: state.activeShopId,
    })),
  );

  const {
    paymentMethods,
    isLoading: paymentMethodsLoading,
    isFetching: paymentMethodsFetching,
  } = usePaymentMethods();
  const {
    createMutation: createPaymentMethod,
    updateMutation: updatePaymentMethod,
    deleteMutation: deletePaymentMethod,
  } = usePaymentMethodMutations();

  const {
    measurementUnits,
    isLoading: measurementUnitsLoading,
    isFetching: measurementUnitsFetching,
  } = useMeasurementUnits();
  const {
    createMutation: createMeasurementUnit,
    updateMutation: updateMeasurementUnit,
    deleteMutation: deleteMeasurementUnit,
  } = useMeasurementUnitMutations();

  const [panel, setPanel] = useState<
    "categories" | "payment-methods" | "measurement-units"
  >("categories");
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
  const [deletingPaymentMethodId, setDeletingPaymentMethodId] = useState<string | null>(null);
  const [editingMeasurementUnit, setEditingMeasurementUnit] = useState<MeasurementUnit | null>(null);
  const [deletingMeasurementUnitId, setDeletingMeasurementUnitId] = useState<string | null>(null);

  if (activeShopLoading) {
    return <ShopLoading />;
  }

  const categoriesView = (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <CardTitle>Productos</CardTitle>
            <CardDescription className="pb-3">
              Categorías para organizar tu catálogo.
            </CardDescription>
            <CategoryForm
              type="product"
              titlePlaceholder="Lácteos"
              shops={shops}
              isOwner={isOwner}
              registerName={registerProduct}
              selectedShopIds={productShopIds}
              onToggleShop={(id) => toggleShopSelection("product", id)}
              onSubmit={onSubmitProduct}
              canSubmit={canCreateProduct}
              isEditing={Boolean(editingProductId)}
              onCancelEdit={cancelProductEdit}
              pending={productPending}
            />
          </div>

          <CategoryList
            title="Listado de categorías"
            icon={<Package className="h-5 w-5 text-primary" />}
            items={categoryProducts}
            loading={categoryProductsLoading}
            emptyText="Aún no tienes categorías para productos."
            isOwner={isOwner}
            onEdit={handleEditProduct}
            hasNextPage={hasMoreProductCategories}
            fetchNextPage={fetchNextProductCategories}
            isFetchingNextPage={isFetchingNextProductCategories}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <CardTitle>Proveedores</CardTitle>
            <CardDescription className="pb-3">
              Clasifica tus proveedores por rubro o tipo de servicio.
            </CardDescription>
            <CategoryForm
              type="supplier"
              titlePlaceholder="Distribuidores"
              shops={shops}
              isOwner={isOwner}
              registerName={registerSupplier}
              selectedShopIds={supplierShopIds}
              onToggleShop={(id) => toggleShopSelection("supplier", id)}
              onSubmit={onSubmitSupplier}
              canSubmit={canCreateSupplier}
              isEditing={Boolean(editingSupplierId)}
              onCancelEdit={cancelSupplierEdit}
              pending={supplierPending}
            />
          </div>
          <CategoryList
            title="Listado de categorías"
            icon={<Truck className="h-5 w-5 text-primary" />}
            items={categorySuppliers}
            loading={categorySuppliersLoading}
            emptyText="Aún no tienes categorías para proveedores."
            isOwner={isOwner}
            onEdit={handleEditSupplier}
            hasNextPage={hasMoreSupplierCategories}
            fetchNextPage={fetchNextSupplierCategories}
            isFetchingNextPage={isFetchingNextSupplierCategories}
          />
        </CardContent>
      </Card>
    </div>
  );

  const paymentMethodsView = (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <div>
            <CardTitle>Métodos de pago</CardTitle>
            <CardDescription>
              Agrega métodos de pago para usarlos en tus operaciones.
            </CardDescription>
          </div>
          <PaymentMethodForm
            onSubmit={(values) => {
              if (!activeShopId) return;

              const payload = {
                name: values.name,
                code: values.code.toUpperCase(),
                description: values.description,
              };

              if (editingPaymentMethod) {
                updatePaymentMethod.mutate(
                  { id: editingPaymentMethod.id, payload },
                  {
                    onSuccess: () => setEditingPaymentMethod(null),
                  },
                );
                return;
              }

              createPaymentMethod.mutate(
                { shopId: activeShopId, ...payload },
                {
                  onSuccess: () => setEditingPaymentMethod(null),
                },
              );
            }}
            isSubmitting={
              editingPaymentMethod
                ? updatePaymentMethod.isPending
                : createPaymentMethod.isPending
            }
            editing={editingPaymentMethod}
            onCancelEdit={() => setEditingPaymentMethod(null)}
          />
        </CardContent>
      </Card>

      <PaymentMethodTable
        paymentMethods={paymentMethods}
        isLoading={paymentMethodsLoading}
        isFetching={paymentMethodsFetching}
        deletingId={deletingPaymentMethodId}
        onEdit={(pm) => setEditingPaymentMethod(pm)}
        onDelete={(pm) => {
          setDeletingPaymentMethodId(pm.id);
          deletePaymentMethod.mutate(pm.id, {
            onSettled: () => setDeletingPaymentMethodId(null),
          });
        }}
      />
    </div>
  );

  const measurementUnitsView = (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <div>
            <CardTitle>Unidades de medida</CardTitle>
            <CardDescription>
              Administra las unidades disponibles para tus productos.
            </CardDescription>
          </div>
          <MeasurementUnitForm
            onSubmit={(values) => {
              if (!activeShopId) return;

              const payload = {
                name: values.name,
                code: values.code.toUpperCase(),
                category: values.category,
                baseUnit: BASE_UNIT_BY_CATEGORY[values.category],
                conversionFactor: values.conversionFactor,
              };

              if (editingMeasurementUnit) {
                updateMeasurementUnit.mutate(
                  { id: editingMeasurementUnit.id, payload },
                  { onSuccess: () => setEditingMeasurementUnit(null) },
                );
                return;
              }

              createMeasurementUnit.mutate(
                { ...payload, shopIds: [activeShopId] },
                {
                  onSuccess: () => setEditingMeasurementUnit(null),
                },
              );
            }}
            isSubmitting={
              editingMeasurementUnit
                ? updateMeasurementUnit.isPending
                : createMeasurementUnit.isPending
            }
            editing={editingMeasurementUnit}
            onCancelEdit={() => setEditingMeasurementUnit(null)}
            disabled={!activeShopId}
          />
        </CardContent>
      </Card>

      <MeasurementUnitTable
        measurementUnits={measurementUnits}
        isLoading={measurementUnitsLoading}
        isFetching={measurementUnitsFetching}
        deletingId={deletingMeasurementUnitId}
        onEdit={(unit) => {
          if (unit.isDefault || unit.isBaseUnit) return;
          setEditingMeasurementUnit(unit);
        }}
        onDelete={(unit) => {
          if (unit.isDefault || unit.isBaseUnit) return;
          setDeletingMeasurementUnitId(unit.id);
          deleteMeasurementUnit.mutate(unit.id, {
            onSettled: () => setDeletingMeasurementUnitId(null),
          });
        }}
      />
    </div>
  );

  const configurationView = (
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      <div className="space-y-2 pt-6">
        <button
          type="button"
          className={cn(
            "w-full rounded-md px-3 py-2 text-sm font-medium transition-colors",
            panel === "categories"
              ? "bg-white text-black shadow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setPanel("categories")}>
          Categorías
        </button>
        <button
          type="button"
          className={cn(
            "w-full rounded-md px-3 py-2 text-sm font-medium transition-colors",
            panel === "payment-methods"
              ? "bg-white text-black shadow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setPanel("payment-methods")}>
          Métodos de pago
        </button>
        <button
          type="button"
          className={cn(
            "w-full rounded-md px-3 py-2 text-sm font-medium transition-colors",
            panel === "measurement-units"
              ? "bg-white text-black shadow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setPanel("measurement-units")}>
          Unidades de medida
        </button>
      </div>

      <div>
        {panel === "categories"
          ? categoriesView
          : panel === "payment-methods"
          ? paymentMethodsView
          : measurementUnitsView}
      </div>
    </div>
  );

  return configurationView;
}
