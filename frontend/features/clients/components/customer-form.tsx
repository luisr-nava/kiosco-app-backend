import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { CreateCustomerDto, Customer } from "../types";
import { BaseForm } from "@/components/form/BaseForm";
import { FormGrid } from "@/components/form/FormGrid";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type Props = {
  form: UseFormReturn<CreateCustomerDto>;
  onSubmit: (values: CreateCustomerDto) => void;
  onCancel: () => void;
  isEdit: boolean;
  isSubmitting: boolean;
};

export default function CustomerForm({ form, onSubmit, onCancel, isEdit, isSubmitting }: Props) {
  return (
    <>
      <BaseForm
        form={form}
        onSubmit={onSubmit}
        onCancel={onCancel}
        submitLabel={isEdit ? "Actualizar producto" : "Crear producto"}
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
                  <Input {...field} placeholder="Luis Navarro" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} placeholder="cliente@email.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormGrid>
        <FormGrid cols={2}>
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} placeholder="+54 9 11 1234-5678" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Direccion</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} placeholder="Av. Corrientes N°1000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormGrid>
        <FormGrid cols={2}>
          <FormField
            control={form.control}
            name="dni"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Documento de Identidad</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} placeholder="3344556677" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Es de pagar los domingos"
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
            name="creditLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Limite de credito</FormLabel>
                <FormControl>
                  <Input {...field} type="number" value={field.value ?? 0} placeholder="10000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormGrid>
      </BaseForm>
    </>
  );
}
