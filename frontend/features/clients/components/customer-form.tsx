import {
  Control,
  FieldErrors,
  UseFormRegister,
  useWatch,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CreateCustomerDto } from "../types";

type Props = {
  register: UseFormRegister<CreateCustomerDto>;
  control: Control<CreateCustomerDto>;
  errors: FieldErrors<CreateCustomerDto>;
  onSubmit: () => void;
  onCancel: () => void;
  isEdit: boolean;
  isSubmitting: boolean;
};

export default function CustomerForm({
  register,
  control,
  errors,
  onSubmit,
  onCancel,
  isEdit,
  isSubmitting,
}: Props) {
  const [watchName] = useWatch<CreateCustomerDto>({
    control,
    name: ["fullName"],
  });

  const normalizedName =
    typeof watchName === "string"
      ? watchName.trim()
      : String(watchName ?? "").trim();

  const canSubmit = Boolean(normalizedName);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="grid gap-1">
          <Label>Nombre completo *</Label>
          <Input
            {...register("fullName", { required: "El nombre es obligatorio" })}
            placeholder="Juan Pérez"
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">
              {errors.fullName.message?.toString()}
            </p>
          )}
        </div>
        <div className="flex gap-5 w-full">
          <div className="grid gap-1 w-1/2">
            <Label>Email</Label>
            <Input
              type="email"
              {...register("email")}
              placeholder="cliente@email.com"
            />
          </div>
          <div className="grid gap-1 w-1/2">
            <Label>DNI</Label>
            <Input
              placeholder="00.000.000"
              {...register("dni", {
                pattern: {
                  value: /^\d+$/,
                  message: "El DNI solo puede contener números",
                },
                minLength: {
                  value: 7,
                  message: "El DNI debe tener al menos 7 dígitos",
                },
                maxLength: {
                  value: 8,
                  message: "El DNI no puede tener más de 8 dígitos",
                },
              })}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\D/g, "");
              }}
            />
          </div>
        </div>
        <div className="flex gap-5 w-full">
          <div className="grid gap-1 w-1/2">
            <Label>Teléfono</Label>
            <Input
              type="tel"
              {...register("phone")}
              placeholder="+54 9 11 1234-5678"
            />
          </div>
          <div className="grid gap-1 w-1/2">
            <Label>Dirección</Label>
            <Input {...register("address")} placeholder="Calle y número" />
          </div>
        </div>
        <div className="grid gap-1">
          <Label>Notas</Label>
          <Textarea
            {...register("notes")}
            placeholder="Preferencias, historial de contacto u otras referencias"
            rows={3}
          />
        </div>
        <div className="grid gap-1">
          <Label>Limite de Crédito</Label>
          <Input
            type="number"
            {...register("creditLimit", {
              valueAsNumber: true,
              min: { value: 0, message: "No puede ser negativo" },
            })}
            placeholder="1000"
          />
        </div>
      </div>
      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {isSubmitting
            ? "Guardando..."
            : isEdit
            ? "Actualizar cliente"
            : "Crear cliente"}
        </Button>
      </ModalFooter>
    </form>
  );
}

