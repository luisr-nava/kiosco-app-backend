import { BaseForm } from "@/components/form/BaseForm";
import { FormGrid } from "@/components/form/FormGrid";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { UseFormReturn } from "react-hook-form";
import { CreateEmployeeDto } from "../types";
import { Textarea } from "@/components/ui/textarea";
interface EmployeeFormProps {
  form: UseFormReturn<CreateEmployeeDto>;
  onSubmit: (values: CreateEmployeeDto) => void;
  onCancel: () => void;
  isEdit: boolean;
  isSubmitting: boolean;
}
export default function EmployeeForm({
  form,
  onSubmit,
  onCancel,
  isEdit,
  isSubmitting,
}: EmployeeFormProps) {
  return (
    <BaseForm
      form={form}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={isEdit ? "Actualizar empleado" : "Crear empleado"}
      isSubmitting={isSubmitting}
    >
      <FormGrid cols={2}>
        <FormField
          control={form.control}
          name="fullName"
          rules={{ required: "El nombre es obligatorio" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nombre completo <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ej: Ana Pérez" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          rules={{ required: "El email es obligatorio" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="email@empresa.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormGrid>
      {!isEdit && (
        <FormGrid cols={1}>
          <FormField
            control={form.control}
            rules={{ required: "El password es obligatorio" }}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Contraseña <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    id="password"
                    placeholder="Mínimo 8 caracteres"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormGrid>
      )}
      <FormGrid cols={2}>
        <FormField
          control={form.control}
          name="dni"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Documento</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Documento" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="+54 9 11 1234 5678"
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormGrid>
      <FormGrid cols={2}>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input
                  id="address"
                  placeholder="Av. Siempre Viva 123"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hireDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de contratacion</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormGrid>
      <FormGrid cols={2}>
        <FormField
          control={form.control}
          name="emergencyContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contacto de emergencia</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nombre / teléfono"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salario</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  step="0.01"
                  min="0"
                  value={field.value ?? 0}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormGrid>
      <FormGrid cols={1}>
        <FormField
          control={form.control}
          name="profileImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto de perfil (URL)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormGrid>
      <FormGrid cols={1}>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Input
                  placeholder="Notas internas"
                  {...field}
                  value={field.value ?? ""}
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
