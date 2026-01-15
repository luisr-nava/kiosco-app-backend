import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateMeasurementUnitDto } from "../types";

interface Props {
  form: UseFormReturn<CreateMeasurementUnitDto>;
  onSubmit: (values: CreateMeasurementUnitDto) => void;
  isEditing: boolean;
  pending: boolean;
  handleCancelEdit: () => void;
}

export const MeasurementUnitForm = ({
  form,
  onSubmit,
  isEditing,
  pending,
  handleCancelEdit,
}: Props) => {
  const { register, handleSubmit } = form;
  const name = form.watch("name");
  const code = form.watch("code");
  const canSubmit = name?.trim().length > 0 && code.trim().length > 0;

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid items-center gap-4 md:grid-cols-3">
        <div className="grid space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            placeholder="Litro"
            {...register("name", { required: true })}
          />
        </div>
        <div className="grid space-y-2">
          <Label htmlFor="code">Código *</Label>
          <Input
            id="code"
            placeholder="L"
            {...register("code", { required: true })}
          />
        </div>
        <div className="flex items-end gap-5 self-end">
          {isEditing && (
            <Button
              type="button"
              variant="destructive"
              className="w-1/2"
              onClick={handleCancelEdit}
              disabled={pending}
            >
              Cancelar edición
            </Button>
          )}
          <Button
            className="ml-auto w-1/2"
            type="submit"
            disabled={pending || !canSubmit}
          >
            {pending
              ? isEditing
                ? "Actualizando..."
                : "Creando..."
              : isEditing
                ? "Actualizar unidad de medida"
                : "Crear unidad de medida"}
          </Button>
        </div>
      </div>
    </form>
  );
};
