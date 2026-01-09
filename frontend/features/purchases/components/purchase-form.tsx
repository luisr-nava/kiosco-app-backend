import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { CreatePurchaseDto } from "../types";
import { cn } from "@/lib/utils";
import { Product } from "@/features/products/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentMethod } from "@/app/(protected)/settings/payment-method/interfaces";
import { Separator } from "@/components/ui/separator";

type Props = {
  form: UseFormReturn<CreatePurchaseDto>;
  onSubmit: (values: CreatePurchaseDto) => void;
  onCancel: () => void;
  isEdit: boolean;
  isSubmitting: boolean;
  suppliers: Supplier[];
  products: Product[];
  paymentMethods: PaymentMethod[];
  isLastItemComplete: () => boolean;
  items: CreatePurchaseDto["items"];
  addItem: () => void;
  removeItem: (index: number) => void;
  updateItem: (
    index: number,
    next: Partial<CreatePurchaseDto["items"][number]>
  ) => void;
};

export default function PurchaseForm({
  form,
  onSubmit,
  onCancel,
  isEdit,
  isSubmitting,
  suppliers,
  products,
  paymentMethods,
  items,
  addItem,
  removeItem,
  updateItem,
  isLastItemComplete,
}: Props) {
  const {
    formState: { isValid },
  } = form;
  const hasItems = items.length > 0;

  const canSubmit = isValid && hasItems;
  return (
    <BaseForm
      form={form}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={isEdit ? "Actualizar producto" : "Crear producto"}
      isSubmitting={isSubmitting}
      submitDisabled={!canSubmit || isSubmitting}
    >
      <FormGrid cols={2}>
        <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proveedor</FormLabel>
              <Select
                value={field.value ?? undefined}
                onValueChange={(v) => field.onChange(v)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sin proveedor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <Controller
          control={form.control}
          name="paymentMethodId"
          rules={{ required: "El metodo de pago es requerido" }}
          render={({ field, fieldState }) => (
            <div className="">
              <Label className="pb-2">
                Metodo de pago <span className="text-destructive">*</span>
              </Label>
              <Select
                key={field.value}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin metodo de pago" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((u) => (
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
      </FormGrid>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Ítems de la compra</Label>
          <button
            type="button"
            onClick={addItem}
            disabled={!isLastItemComplete()}
            className={cn(
              "text-sm",
              isLastItemComplete()
                ? "text-primary"
                : "text-muted-foreground cursor-not-allowed"
            )}
          >
            + Agregar ítem
          </button>
        </div>

        <div className="max-h-60 min-h-60 space-y-3 overflow-y-auto pr-1">
          {items.map((_, index) => (
            <Card key={index} className="gap-0 bg-transparent px-2 py-2">
              {/* PRODUCTO */}
              <FormGrid cols={4}>
                <FormField
                  control={form.control}
                  name={`items.${index}.shopProductId`}
                  rules={{ required: "Producto requerido" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Producto <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sin producto" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CANTIDAD */}
                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  rules={{
                    required: "La cantidad es requerida",
                    min: { value: 1, message: "Debe ser mayor a 0" },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Cantidad <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value);

                            field.onChange(value);
                            updateItem(index, { quantity: value });
                          }}
                        />
                      </FormControl>
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />

                {/* COSTO */}
                <FormField
                  control={form.control}
                  name={`items.${index}.unitCost`}
                  rules={{
                    required: "El costo es requerido",
                    min: { value: 0.01, message: "Debe ser mayor a 0" },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Costo unitario{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Costo"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value);

                            field.onChange(value);
                            updateItem(index, { unitCost: value });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* SUBTOTAL */}
                <FormField
                  control={form.control}
                  name={`items.${index}.subtotal`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtotal</FormLabel>
                      <FormControl>
                        <Input readOnly value={field.value ?? 0} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormGrid>

              {/* QUITAR */}
              <div className="flex justify-end">
                <Button
                  variant={"ghost"}
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-destructive hover:text-destructive justify-end text-sm hover:bg-transparent"
                >
                  Quitar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Separator />
      <FormGrid cols={1}>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Compra quincenal de mercadería"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormGrid>
    </BaseForm>
  );
}
