import { useEffect } from "react";
import {
  Control,
  FieldErrors,
  useForm,
  UseFormRegister,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { CreateEmployeeDto, Employee, EmployeeRole } from "../types";
import { useShopQuery } from "@/features/shop/hooks/useShopQuery";
import { ModalFooter } from "@/components/ui/modal";

interface EmployeeFormProps {
  register: UseFormRegister<CreateEmployeeDto>;
  control: Control<CreateEmployeeDto>;
  errors: FieldErrors<CreateEmployeeDto>;
  onSubmit: () => void;
  onCancel: () => void;
  isEdit: boolean;
  isSubmitting: boolean;
}

export default function EmployeeForm({
  register,
  control,
  errors,
  onSubmit,
  onCancel,
  isEdit,
  isSubmitting,
}: EmployeeFormProps) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Nombre completo</Label>
          <Input
            placeholder="Ej: Ana Pérez"
            {...register("fullName", { required: "El nombre es obligatorio" })}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">
              {errors.fullName.message?.toString()}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@empresa.com"
            {...register("email", { required: true })}
          />
        </div>
      </div>
      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <PasswordInput
            id="password"
            placeholder="Mínimo 8 caracteres"
            {...register("password", {
              required: "La contraseña es obligatoria",
              minLength: {
                value: 8,
                message: "Debe tener al menos 8 caracteres",
              },
            })}
          />
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message?.toString()}
            </p>
          )}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dni">DNI</Label>
          <Input
            id="dni"
            placeholder="Documento"
            {...register("dni", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            placeholder="+54 9 11 1234 5678"
            {...register("phone")}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            placeholder="Av. Siempre Viva 123"
            {...register("address")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hireDate">Fecha de contratación</Label>
          <Input id="hireDate" type="date" {...register("hireDate")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="salary">Salario</Label>
          <Input
            id="salary"
            type="number"
            step="0.01"
            min="0"
            placeholder="0"
            {...register("salary", {
              valueAsNumber: true,
              min: { value: 0, message: "No puede ser negativo" },
            })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Contacto de emergencia</Label>
          <Input
            id="emergencyContact"
            placeholder="Nombre / teléfono"
            {...register("emergencyContact")}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="profileImage">Foto de perfil (URL)</Label>
          <Input
            id="profileImage"
            placeholder="https://..."
            {...register("profileImage")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Input
            id="notes"
            placeholder="Notas internas"
            {...register("notes")}
          />
        </div>
      </div>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {isSubmitting
            ? "Guardando..."
            : isEdit
            ? "Actualizar empleado"
            : "Crear empleado"}
        </Button>
      </ModalFooter>
    </form>
  );
}

