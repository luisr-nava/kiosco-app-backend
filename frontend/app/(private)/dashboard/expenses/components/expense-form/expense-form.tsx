import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Expense } from "../../interfaces";

export interface ExpenseFormValues {
  description: string;
  amount: number;
  date: string;
  paymentMethodId?: string;
  category?: string | null;
}

interface Props {
  onSubmit: (values: ExpenseFormValues) => void;
  isSubmitting: boolean;
  editingExpense?: Expense | null;
  onCancelEdit: () => void;
}

const DEFAULT_VALUES: ExpenseFormValues = {
  description: "",
  amount: 0,
  date: "",
  paymentMethodId: "",
  category: "",
};

export const ExpenseForm = ({
  onSubmit,
  isSubmitting,
  editingExpense,
  onCancelEdit,
}: Props) => {
  const form = useForm<ExpenseFormValues>({
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (editingExpense) {
      form.reset({
        description: editingExpense.description || "",
        amount: editingExpense.amount,
        date: editingExpense.date
          ? editingExpense.date.split("T")[0]
          : "",
        paymentMethodId: editingExpense.paymentMethodId || "",
        category: editingExpense.category || "",
      });
    } else {
      form.reset(DEFAULT_VALUES);
    }
  }, [editingExpense, form]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      ...values,
      amount: Number(values.amount),
      paymentMethodId: values.paymentMethodId?.trim(),
      category: values.category?.trim() || null,
    });
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Input
            id="description"
            placeholder="Pago de alquiler"
            {...form.register("description", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Monto</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0"
            {...form.register("amount", { valueAsNumber: true, required: true })}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Input id="date" type="date" {...form.register("date", { required: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentMethodId">Método de pago (ID)</Label>
          <Input
            id="paymentMethodId"
            placeholder="paymentMethodId"
            {...form.register("paymentMethodId")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoría</Label>
        <Input
          id="category"
          placeholder="Categoría opcional"
          {...form.register("category")}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? editingExpense
              ? "Guardando..."
              : "Creando..."
            : editingExpense
            ? "Actualizar gasto"
            : "Crear gasto"}
        </Button>
        {editingExpense && (
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
