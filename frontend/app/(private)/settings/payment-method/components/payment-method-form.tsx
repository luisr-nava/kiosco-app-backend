import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PaymentMethod } from "../interfaces";

export interface PaymentMethodFormValues {
  name: string;
  code: string;
  description?: string | null;
}

interface Props {
  onSubmit: (values: PaymentMethodFormValues) => void;
  isSubmitting: boolean;
  editing?: PaymentMethod | null;
  onCancelEdit?: () => void;
}

const DEFAULT_VALUES: PaymentMethodFormValues = {
  name: "",
  code: "",
  description: "",
};

export const PaymentMethodForm = ({
  onSubmit,
  isSubmitting,
  editing,
  onCancelEdit,
}: Props) => {
  const form = useForm<PaymentMethodFormValues>({
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        code: editing.code,
        description: editing.description || "",
      });
    } else {
      form.reset(DEFAULT_VALUES);
    }
  }, [editing, form]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      name: values.name.trim(),
      code: values.code.trim(),
      description: values.description?.trim() || null,
    });
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            placeholder="Efectivo"
            {...form.register("name", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Código *</Label>
          <Input
            id="code"
            placeholder="CASH"
            {...form.register("code", { required: true })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          placeholder="Pago en efectivo"
          {...form.register("description")}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? editing
              ? "Guardando..."
              : "Creando..."
            : editing
            ? "Actualizar método"
            : "Crear método"}
        </Button>
        {editing && onCancelEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancelEdit}
            disabled={isSubmitting}>
            Cancelar edición
          </Button>
        )}
      </div>
    </form>
  );
};
