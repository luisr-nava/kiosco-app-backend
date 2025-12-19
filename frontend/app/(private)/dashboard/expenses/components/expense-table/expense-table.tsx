import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { expandableRowVariants } from "@/lib/animations";
import { Calendar, CreditCard, FileText, Tag } from "lucide-react";
import type { Expense } from "../../interfaces";

interface Props {
  expenses: Expense[];
  isLoading: boolean;
  isFetching: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  deletingId?: string | null;
}

export const ExpenseTable = ({
  expenses,
  isLoading,
  isFetching,
  onEdit,
  onDelete,
  deletingId,
}: Props) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(value || 0);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Cargando gastos...
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay gastos registrados en esta tienda.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="hidden sm:grid grid-cols-4 bg-muted px-4 py-2 text-sm font-semibold">
        <span>Descripción</span>
        <span className="text-center">Fecha</span>
        <span className="text-center">Monto</span>
        <span className="text-right">Acción</span>
      </div>
      <div className="divide-y">
        {expenses.map((expense, index) => {
          const isOpen = expandedRow === expense.id;
          const isLastRow = index === expenses.length - 1;

          return (
            <div key={expense.id} className="last:border-b-0">
              <motion.div
                whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.04)" }}
                whileTap={{ scale: 0.995 }}
                className={`w-full text-left transition-colors px-4 py-3 grid grid-cols-[1fr_auto] items-center gap-3 sm:grid-cols-4 sm:items-center ${
                  isOpen ? "bg-muted/50" : ""
                }`}
                role="button"
                tabIndex={0}
                onClick={() => setExpandedRow(isOpen ? null : expense.id)}>
                <div className="sm:col-span-1 flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-medium line-clamp-1 flex items-center gap-2">
                      {expense.description}
                    </span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {expense.category || "Sin categoría"}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center justify-center text-sm text-muted-foreground">
                  <span className="truncate">
                    {expense.date
                      ? new Date(expense.date).toLocaleDateString()
                      : "Sin fecha"}
                  </span>
                </div>
                <div className="hidden sm:flex items-center justify-center text-sm font-semibold">
                  {formatCurrency(expense.amount || 0)}
                </div>
                <div className="hidden sm:flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(expense);
                    }}>
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="ml-2"
                    disabled={deletingId === expense.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(expense);
                    }}>
                    {deletingId === expense.id ? "Eliminando..." : "Eliminar"}
                  </Button>
                </div>
                <div className="sm:hidden col-span-2 flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>
                    {expense.date
                      ? new Date(expense.date).toLocaleDateString()
                      : "Sin fecha"}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(expense.amount || 0)}
                  </span>
                </div>
              </motion.div>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    variants={expandableRowVariants}
                    className="overflow-hidden">
                    <div className="space-y-3 bg-muted/40 px-4 py-3 text-sm">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between sm:flex-col sm:items-start sm:gap-1">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Descripción:
                            </span>
                            <p className="font-medium text-right sm:text-left">
                              {expense.description}
                            </p>
                          </div>
                          <div className="flex items-start justify-between sm:flex-col sm:items-start sm:gap-1">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Fecha:
                            </span>
                            <p className="font-medium text-right sm:text-left">
                              {expense.date
                                ? new Date(expense.date).toLocaleDateString()
                                : "Sin fecha"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start justify-between sm:flex-col sm:items-start sm:gap-1">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Método de pago:
                            </span>
                            <p className="font-medium text-right sm:text-left">
                              {expense.paymentMethodId || "Sin método"}
                            </p>
                          </div>
                          <div className="flex items-start justify-between sm:flex-col sm:items-start sm:gap-1">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              Categoría:
                            </span>
                            <p className="font-medium text-right sm:text-left">
                              {expense.category || "Sin categoría"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 sm:hidden">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(expense);
                          }}>
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deletingId === expense.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(expense);
                          }}>
                          {deletingId === expense.id ? "Eliminando..." : "Eliminar"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!isLastRow && <div className="border-b sm:hidden" />}
            </div>
          );
        })}
      </div>
      {isFetching && (
        <div className="flex items-center gap-2 border-t px-4 py-3 text-xs text-muted-foreground">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Actualizando lista...
        </div>
      )}
    </div>
  );
};
