import { Input } from "@/components/ui/input";
import type { CreateProductDto, Product } from "../types";
import type { MeasurementUnit } from "@/app/(protected)/settings/measurement-unit/interfaces";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Supplier } from "@/features/suppliers/types";
import { BaseForm } from "@/components/form/BaseForm";
import { FormGrid } from "@/components/form/FormGrid";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Props = {
  form: UseFormReturn<CreateProductDto>;
  onSubmit: (values: CreateProductDto) => void;
  onCancel: () => void;
  isEdit: boolean;
  isSubmitting: boolean;
  suppliers: Supplier[];
  measurementUnits: MeasurementUnit[];
  editProduct: Product;
};

export default function ProductForm({
  form,
  onSubmit,
  onCancel,
  isEdit,
  isSubmitting,
  suppliers,
  measurementUnits,
}: Props) {
  return (
    <BaseForm
      form={form}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={isEdit ? "Actualizar producto" : "Crear producto"}
      isSubmitting={isSubmitting}
    >
      <FormGrid cols={1}>
        <FormField
          control={form.control}
          name="name"
          rules={{ required: "El nombre es obligatorio" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nombre completo <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Jabón" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormGrid>
      <FormGrid cols={2}>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Producto de limpieza" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="barcode"
          rules={{ required: "El código de barras es obligatorio" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Código de barras <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="123123" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormGrid>
      <FormGrid cols={3}>
        <FormField
          control={form.control}
          rules={{
            required: "El precio de costo es requerido",
            min: {
              value: 0.01,
              message: "El precio debe ser mayor a 0",
            },
            validate: (costPrice) => {
              const salePrice = form.getValues("salePrice");

              if (salePrice == null) return true;

              return (
                costPrice! < salePrice ||
                "El precio de costo debe ser menor al precio de venta"
              );
            },
          }}
          name="costPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Precio costo <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="100"
                  {...field}
                  type="number"
                  min={0}
                  step="0.01"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="salePrice"
          rules={{
            required: "El precio de venta es requerido",
            min: {
              value: 0.01,
              message: "El precio debe ser mayor a 0",
            },
            validate: (salePrice) => {
              const costPrice = form.getValues("costPrice");

              if (costPrice == null) return true;

              return (
                salePrice! > costPrice ||
                "El precio de venta debe ser mayor al precio de costo"
              );
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Precio de venta <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="150"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stock"
          rules={{
            required: "El stock es requerido",
            min: {
              value: 1,
              message: "El stock debe ser mayor a 0",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Stock <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step="1"
                  placeholder="10"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormGrid>
      <FormGrid cols={2}>
        <Controller
          control={form.control}
          name="measurementUnitId"
          rules={{ required: "La unidad es requerida" }}
          render={({ field, fieldState }) => (
            <div className="">
              <Label className="pb-2">
                Unidad de medida <span className="text-destructive">*</span>
              </Label>
              <Select
                key={field.value}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar unidad" />
                </SelectTrigger>
                <SelectContent>
                  {measurementUnits.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.error && (
                <p className="text-destructive text-xs">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />

        {/* <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proveedor</FormLabel>

              <Select
                value={field.value ?? ""}
                onValueChange={(value) => field.onChange(value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un proveedor" />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        /> */}
      </FormGrid>
      {isEdit && (
        <FormGrid cols={1}>
          <Controller
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Producto activo</p>
                  <p className="text-muted-foreground text-xs">
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
        </FormGrid>
      )}
    </BaseForm>
  );
}
