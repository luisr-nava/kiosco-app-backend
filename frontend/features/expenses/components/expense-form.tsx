import { Controller, UseFormReturn } from "react-hook-form";
import { CreateExpenseDto } from "../types";
import { PaymentMethod } from "@/app/(protected)/settings/payment-method/interfaces";
import { BaseForm } from "@/components/form/BaseForm";
import { FormGrid } from "@/components/form/FormGrid";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  form: UseFormReturn<CreateExpenseDto>;
  onSubmit: (values: CreateExpenseDto) => void;
  onCancel: () => void;
  isEdit: boolean;
  isSubmitting: boolean;
  paymentMethods: PaymentMethod[];
}

export default function ExpenseForm({
  form,
  onSubmit,
  onCancel,
  isEdit,
  isSubmitting,
  paymentMethods = [],
}: Props) {
  return (
    <BaseForm
      form={form}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={isEdit ? "Actualizar egreso" : "Crear egreso"}
      isSubmitting={isSubmitting}
    >
      <FormGrid cols={2}>
        <FormField
          control={form.control}
          name="description"
          rules={{ required: "La descripción es obligatoria" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Descripción <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Pago de alquiler" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          rules={{ required: "El monto es obligatorio" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Monto <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="0" type="number" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormGrid>
      <FormGrid cols={2}>
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
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
              <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar unidad" />
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
                <p className="text-destructive text-xs">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />
      </FormGrid>
    </BaseForm>
  );
}
