import { ReactNode } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ModalFooter } from "@/components/ui/modal";
interface BaseFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void;
  onCancel: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
  children: React.ReactNode;
}

export function BaseForm<T extends FieldValues>({
  form,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting = false,
  children,
}: BaseFormProps<T>) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {children}

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}>
            Cancelar
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : submitLabel}
          </Button>
        </ModalFooter>
      </form>
    </Form>
  );
}

