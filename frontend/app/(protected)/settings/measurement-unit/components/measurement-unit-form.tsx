import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  MeasurementUnit,
  MeasurementUnitCategory,
  MeasurementBaseUnit,
} from "../interfaces";

export interface MeasurementUnitFormValues {
  name: string;
  code: string;
  category: MeasurementUnitCategory;
  conversionFactor: number;
}

interface Props {
  onSubmit: (values: MeasurementUnitFormValues) => void;
  isSubmitting: boolean;
  editing?: MeasurementUnit | null;
  onCancelEdit?: () => void;
  disabled?: boolean;
}

const DEFAULT_VALUES: MeasurementUnitFormValues = {
  name: "",
  code: "",
  category: "UNIT",
  conversionFactor: 1,
};

const CATEGORY_LABELS: Record<MeasurementUnitCategory, string> = {
  UNIT: "Unidades",
  WEIGHT: "Peso",
  VOLUME: "Volumen",
};

const BASE_UNIT_BY_CATEGORY: Record<
  MeasurementUnitCategory,
  MeasurementBaseUnit
> = {
  UNIT: "UNIT",
  WEIGHT: "KG",
  VOLUME: "L",
};

export const MeasurementUnitForm = ({
  onSubmit,
  isSubmitting,
  editing,
  onCancelEdit,
  disabled,
}: Props) => {
  const form = useForm<MeasurementUnitFormValues>({
    defaultValues: DEFAULT_VALUES,
  });

  const category = form.watch("category");
  const baseUnit = BASE_UNIT_BY_CATEGORY[category] || "UNIT";

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        code: editing.code,
        category: editing.category,
        conversionFactor: editing.conversionFactor ?? 1,
      });
    } else {
      form.reset(DEFAULT_VALUES);
    }
  }, [editing, form]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      name: values.name.trim(),
      code: values.code.trim(),
      category: values.category,
      conversionFactor: Number(values.conversionFactor) || 0,
    });
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            placeholder="Litro"
            disabled={disabled}
            {...form.register("name", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Código *</Label>
          <Input
            id="code"
            placeholder="L"
            disabled={disabled}
            {...form.register("code", { required: true })}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Categoría *</Label>
          <select
            id="category"
            className="bg-background h-10 rounded-md border px-3 text-sm"
            disabled={disabled}
            {...form.register("category", { required: true })}
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Unidad base</Label>
          <Input value={baseUnit} disabled readOnly />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="conversionFactor">Factor de conversión *</Label>
        <Input
          id="conversionFactor"
          type="number"
          min={0.000001}
          step="0.000001"
          placeholder="1"
          disabled={disabled}
          {...form.register("conversionFactor", {
            required: true,
            setValueAs: (value) => (value === "" ? 0 : Number(value)),
          })}
        />
        <p className="text-muted-foreground text-xs">
          Usa 1 para unidades base; para múltiplos usa el equivalente a la
          unidad base (ej: gramos = 0.001 KG).
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting || disabled}>
          {isSubmitting
            ? editing
              ? "Guardando..."
              : "Creando..."
            : editing
              ? "Actualizar unidad"
              : "Crear unidad"}
        </Button>
        {editing && onCancelEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancelEdit}
            disabled={isSubmitting}
          >
            Cancelar edición
          </Button>
        )}
      </div>
    </form>
  );
};
