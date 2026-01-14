import { UseFormReturn } from "react-hook-form";
import { CreatePaymentMethodDto } from "../types";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";

interface Props {
  form: UseFormReturn<CreatePaymentMethodDto>;
  onSubmit: (values: CreatePaymentMethodDto) => void;
  isEditing: boolean;
  pending: boolean;
  handleCancelEdit: () => void;
}

export const PaymentMethodForm = ({
  form,
  onSubmit,
  isEditing,
  pending,
  handleCancelEdit,
}: Props) => {
  const { register, handleSubmit } = form;
  const name = form.watch("name");
  const canSubmit = name?.trim().length > 0;
  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid items-center gap-4 md:grid-cols-4">
        <div className="grid space-y-2">
          <Label htmlFor="name">
            Nombre <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Efectivo"
            {...register("name", { required: true })}
          />
        </div>
        <div className="grid space-y-2">
          <Label htmlFor="code">
            Código <span className="text-destructive">*</span>
          </Label>
          <Input
            id="code"
            placeholder="CASH"
            {...register("code", { required: true })}
          />
        </div>
        <div className="grid space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Input
            id="description"
            placeholder="Pago en efectivo"
            {...register("description")}
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
                ? "Actualizar Metodo de pago"
                : "Crear Metodo de pago"}
          </Button>
        </div>
      </div>
    </form>
  );
};
