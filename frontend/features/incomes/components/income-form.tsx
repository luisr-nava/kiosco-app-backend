import { PaymentMethod } from "@/app/(protected)/settings/payment-method/interfaces";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";
import { CreateIncomeDto } from "../types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  register: UseFormRegister<CreateIncomeDto>;
  control: Control<CreateIncomeDto>;
  errors: FieldErrors<CreateIncomeDto>;
  onSubmit: () => void;
  onCancel: () => void;
  isEdit: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  paymentMethods: PaymentMethod[];
}

export default function IncomeForm({
  register,
  control,
  errors,
  onSubmit,
  onCancel,
  isEdit,
  isValid,
  isSubmitting,
  paymentMethods = [],
}: Props) {
  return (
    <form>
      <div className="space-y-3">
        <div className="grid gap-1">
          <Label>
            Descripcion <span className="text-destructive">*</span>
          </Label>
          <Textarea
            {...register("description", {
              required: "La descripción es obligatoria",
            })}
            placeholder="Ingreso..."
            className="resize-none"
            cols={3}
          />
          {errors.description && (
            <p className="text-xs text-destructive">
              {errors.description.message?.toString()}
            </p>
          )}
        </div>

        <div className="grid gap-1">
          <Label>
            Monto <span className="text-destructive">*</span>
          </Label>
          <Input
            type="number"
            {...register("amount", {
              valueAsNumber: true,
              min: { value: 0, message: "No puede ser negativo" },
            })}
            placeholder="1000"
          />
        </div>
        {errors.amount && (
          <p className="text-xs text-destructive">
            {errors.amount.message?.toString()}
          </p>
        )}
        <div className="grid gap-1">
          <Label>
            Metodo de Pago <span className="text-destructive">*</span>
          </Label>
          <Controller
            control={control}
            name="paymentMethodId"
            rules={{ required: "El método de pago es obligatorio" }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>

                <SelectContent align="end">
                  {paymentMethods.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.paymentMethodId && (
            <p className="text-xs text-destructive">
              {errors.paymentMethodId.message?.toString()}
            </p>
          )}
        </div>
      </div>
      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          variant="default">
          {isSubmitting
            ? "Guardando..."
            : isEdit
            ? "Actualizar ingreso"
            : "Crear ingreso"}
        </Button>
      </ModalFooter>
    </form>
  );
}

