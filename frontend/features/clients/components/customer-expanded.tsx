import { useCurrencyFormatter } from "@/src/hooks/useCurrencyFormatter";
import { Customer } from "../types";

interface CustomerExpandedProps {
  customer: Customer;
}

export default function CustomerExpanded({ customer }: CustomerExpandedProps) {
  const formatCurrency = useCurrencyFormatter();

  return (
    <div className="grid grid-cols-2 gap-4 p-4 text-sm">
      {/* Columna izquierda */}
      <div className="space-y-2">
        <div>
          <p className="text-muted-foreground">Direccion:</p>
          <p className="font-medium text-right sm:text-left">
            {customer.address || "Sin Direccion"}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">Limite de Crédito:</p>
          <p className="font-medium text-right sm:text-left">
            {formatCurrency(customer.creditLimit)}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">Estado actual:</p>
          <p className="font-medium text-right sm:text-left">
            {formatCurrency(customer.currentBalance)}
          </p>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="space-y-2">
        <div>
          <p className="text-muted-foreground">Notas:</p>
          <p className="font-medium text-right sm:text-left">
            {customer.notes || "Sin notas"}
          </p>
        </div>
      </div>
    </div>
  );
}

