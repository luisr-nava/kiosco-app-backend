import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Controller, useWatch } from "react-hook-form";
import type { CreateProductDto } from "../interfaces";
import type { UseProductFormReturn } from "../hooks/useProductForm";
import type { Supplier } from "@/lib/types/supplier";
import { Switch } from "@/components/ui/switch";
import type { MeasurementUnit } from "@/app/(private)/settings/measurement-unit/interfaces";

type Props = Pick<
  UseProductFormReturn,
  | "activeShopId"
  | "createMutation"
  | "updateMutation"
  | "register"
  | "onSubmit"
  | "reset"
  | "productModal"
  | "editProductModal"
  | "initialForm"
  | "control"
  | "errors"
> & {
  suppliers: Supplier[];
  suppliersLoading: boolean;
  measurementUnits: MeasurementUnit[];
  measurementUnitsLoading: boolean;
};

export const ProductForm = ({
  activeShopId,
  createMutation,
  updateMutation,
  register,
  onSubmit,
  reset,
  productModal,
  editProductModal,
  initialForm,
  control,
  errors,
  suppliers,
  suppliersLoading,
  measurementUnits,
  measurementUnitsLoading,
}: Props) => {
  const [
    watchName,
    watchCost,
    watchSalePrice,
    watchStock,
    watchShopId,
    watchMeasurementUnitId,
  ] = useWatch<CreateProductDto>({
    control,
    name: [
      "name",
      "costPrice",
      "salePrice",
      "stock",
      "shopId",
      "measurementUnitId",
    ],
  });

  const salePriceValue =
    typeof watchSalePrice === "number"
      ? watchSalePrice
      : Number(watchSalePrice || 0);
  const costPriceValue =
    typeof watchCost === "number" ? watchCost : Number(watchCost || 0);
  const stockValue =
    typeof watchStock === "number" ? watchStock : Number(watchStock || 0);
  const normalizedName =
    typeof watchName === "string"
      ? watchName.trim()
      : String(watchName ?? "").trim();

  const canSubmit = Boolean(
    normalizedName &&
      watchShopId &&
      salePriceValue > 0 &&
      costPriceValue < salePriceValue &&
      stockValue > 0 &&
      watchMeasurementUnitId,
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="grid gap-1">
          <Label>Nombre *</Label>
          <Input
            {...register("name", { required: true })}
            placeholder="Jabón"
          />
        </div>
        <div className="grid gap-1">
          <Label>Descripción</Label>
          <Input {...register("description")} placeholder="Opcional" />
        </div>
        <div className="grid gap-1">
          <Label>Código de barras</Label>
          <Input {...register("barcode")} placeholder="EAN/UPC" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="grid gap-1">
            <Label>Precio costo</Label>
            <Input
              type="number"
              min={0.01}
              step="0.01"
              {...register("costPrice", {
                required: "El precio de costo es requerido",
                setValueAs: (value) => (value === "" ? 0 : Number(value)),
                validate: (value, formValues) => {
                  const sale = Number(
                    (formValues as CreateProductDto)?.salePrice ?? 0,
                  );
                  if (value <= 0) return "El costo debe ser mayor a 0";
                  if (sale && value >= sale) {
                    return "El costo debe ser menor al precio de venta";
                  }
                  return true;
                },
              })}
            />
            {errors.costPrice && (
              <p className="text-xs text-destructive">
                {errors.costPrice.message?.toString()}
              </p>
            )}
          </div>
          <div className="grid gap-1">
            <Label>Precio venta *</Label>
            <Input
              type="number"
              min={0.01}
              step="0.01"
              {...register("salePrice", {
                required: "El precio de venta es requerido",
                setValueAs: (value) => (value === "" ? 0 : Number(value)),
                validate: (value, formValues) => {
                  const cost = Number(
                    (formValues as CreateProductDto)?.costPrice ?? 0,
                  );
                  if (value <= 0) return "El precio de venta debe ser mayor a 0";
                  if (cost && value <= cost) {
                    return "El precio de venta debe ser mayor al costo";
                  }
                  return true;
                },
              })}
            />
            {errors.salePrice && (
              <p className="text-xs text-destructive">
                {errors.salePrice.message?.toString()}
              </p>
            )}
          </div>
          <div className="grid gap-1">
            <Label>Stock</Label>
            <Input
              type="number"
              min={1}
              {...register("stock", {
                setValueAs: (value) => (value === "" ? 0 : Number(value)),
                validate: (value) => {
                  if (value <= 0) return "El stock debe ser mayor a 0";
                  return true;
                },
              })}
            />
            {errors.stock && (
              <p className="text-xs text-destructive">
                {errors.stock.message?.toString()}
              </p>
            )}
          </div>
        </div>
        <div className="grid gap-1">
          <Label>Proveedor (opcional)</Label>
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            {...register("supplierId")}
            disabled={suppliersLoading}>
            <option value="">Sin proveedor</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1">
          <Label>Unidad de medida *</Label>
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            {...register("measurementUnitId", { required: true })}
            disabled={measurementUnitsLoading || measurementUnits.length === 0}>
            <option value="">Seleccionar unidad</option>
            {measurementUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.code})
              </option>
            ))}
          </select>
          {measurementUnits.length === 0 && !measurementUnitsLoading && (
            <p className="text-xs text-destructive">
              No hay unidades disponibles para esta tienda.
            </p>
          )}
        </div>
        {editProductModal.isOpen && (
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Producto activo</p>
                  <p className="text-xs text-muted-foreground">
                    Desactívalo para ocultarlo del inventario.
                  </p>
                </div>
                <Switch
                  checked={Boolean(field.value)}
                  onCheckedChange={(checked) => field.onChange(checked)}
                />
              </div>
            )}
          />
        )}
      </div>
      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            productModal.close();
            editProductModal.close();
            reset({ ...initialForm, shopId: activeShopId || "" });
          }}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={
            !canSubmit || createMutation.isPending || updateMutation.isPending
          }>
          {createMutation.isPending || updateMutation.isPending
            ? "Guardando..."
            : editProductModal.isOpen
            ? "Actualizar producto"
            : "Crear producto"}
        </Button>
      </ModalFooter>
    </form>
  );
};
