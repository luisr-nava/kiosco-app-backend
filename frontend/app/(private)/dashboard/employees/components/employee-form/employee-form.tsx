import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PasswordInput } from "@/components/ui/password-input";
import { Employee, EmployeeRole } from "../../interfaces";

const RequiredMark = () => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="ml-1 text-destructive" aria-label="Requerido">
        *
      </span>
    </TooltipTrigger>
    <TooltipContent>Campo requerido por el backend</TooltipContent>
  </Tooltip>
);

export interface EmployeeFormValues {
  fullName: string;
  email: string;
  password: string;
  dni: string;
  phone?: string | null;
  address?: string | null;
  hireDate?: string | null;
  salary?: number | null;
  notes?: string | null;
  profileImage?: string | null;
  emergencyContact?: string | null;
  role: EmployeeRole;
}

interface EmployeeFormProps {
  onSubmit: (values: EmployeeFormValues) => void;
  isSubmitting: boolean;
  editingEmployee?: Employee | null;
  onCancelEdit: () => void;
}

const DEFAULT_VALUES: EmployeeFormValues = {
  fullName: "",
  password: "",
  email: "",
  dni: "",
  phone: "",
  address: "",
  hireDate: "",
  salary: undefined,
  notes: "",
  profileImage: "",
  emergencyContact: "",
  role: "EMPLOYEE",
};

export const EmployeeForm = ({
  onSubmit,
  isSubmitting,
  editingEmployee,
  onCancelEdit,
}: EmployeeFormProps) => {
  const form = useForm<EmployeeFormValues>({
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (editingEmployee) {
      form.reset({
        fullName: editingEmployee.fullName,
        email: editingEmployee.email,
        password: "",
        dni: editingEmployee.dni || "",
        phone: editingEmployee.phone || "",
        address: editingEmployee.address || "",
        hireDate: editingEmployee.hireDate
          ? editingEmployee.hireDate.split("T")[0]
          : "",
        salary: editingEmployee.salary ?? undefined,
        notes: editingEmployee.notes || "",
        profileImage: editingEmployee.profileImage || "",
        emergencyContact: editingEmployee.emergencyContact || "",
        role: editingEmployee.role,
      });
    } else {
      form.reset(DEFAULT_VALUES);
    }
  }, [editingEmployee, form]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      ...values,
      password: values.password || "",
      phone: values.phone?.trim() || null,
      address: values.address?.trim() || null,
      hireDate: values.hireDate || null,
      salary: values.salary ? Number(values.salary) : null,
      notes: values.notes?.trim() || null,
      profileImage: values.profileImage?.trim() || null,
      emergencyContact: values.emergencyContact?.trim() || null,
    });
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Nombre completo
            <RequiredMark />
          </Label>
          <Input
            id="fullName"
            placeholder="Ej: Ana Pérez"
            {...form.register("fullName", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">
            Email
            <RequiredMark />
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="email@empresa.com"
            {...form.register("email", { required: true })}
          />
        </div>
      </div>

      {!editingEmployee && (
        <div className="space-y-2">
          <Label htmlFor="password">
            Contraseña
            <RequiredMark />
          </Label>
          <PasswordInput
            id="password"
            placeholder="Mínimo 8 caracteres"
            {...form.register("password", { required: !editingEmployee })}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dni">DNI</Label>
          <Input
            id="dni"
            placeholder="Documento"
            {...form.register("dni", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            placeholder="+54 9 11 1234 5678"
            {...form.register("phone")}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            placeholder="Av. Siempre Viva 123"
            {...form.register("address")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hireDate">Fecha de contratación</Label>
          <Input id="hireDate" type="date" {...form.register("hireDate")} />
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
            {...form.register("salary", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Contacto de emergencia</Label>
          <Input
            id="emergencyContact"
            placeholder="Nombre / teléfono"
            {...form.register("emergencyContact")}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="profileImage">Foto de perfil (URL)</Label>
          <Input
            id="profileImage"
            placeholder="https://..."
            {...form.register("profileImage")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Input
            id="notes"
            placeholder="Notas internas"
            {...form.register("notes")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <div className="rounded-md border bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
          Empleado (por defecto)
        </div>
        <input type="hidden" {...form.register("role")} value="EMPLOYEE" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? editingEmployee
              ? "Guardando..."
              : "Creando..."
            : editingEmployee
            ? "Actualizar empleado"
            : "Crear empleado"}
        </Button>
        {editingEmployee && (
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

