import { Button } from "@/components/ui/button";
import { Edit3, Trash2 } from "lucide-react";
import type { PaymentMethod } from "../interfaces";

interface Props {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  isFetching: boolean;
  onEdit: (pm: PaymentMethod) => void;
  onDelete: (pm: PaymentMethod) => void;
  deletingId?: string | null;
}

export const PaymentMethodTable = ({
  paymentMethods,
  isLoading,
  isFetching,
  onEdit,
  onDelete,
  deletingId,
}: Props) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Cargando métodos de pago...
      </div>
    );
  }

  if (!paymentMethods.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay métodos de pago registrados.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Nombre</th>
            <th className="px-4 py-3 text-left font-medium">Código</th>
            <th className="px-4 py-3 text-left font-medium">Descripción</th>
            <th className="px-4 py-3 text-left font-medium">Estado</th>
            <th className="px-4 py-3 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paymentMethods.map((pm) => (
            <tr key={pm.id} className="border-t">
              <td className="px-4 py-3">{pm.name}</td>
              <td className="px-4 py-3">{pm.code}</td>
              <td className="px-4 py-3">
                {pm.description?.trim() || "Sin descripción"}
              </td>
              <td className="px-4 py-3">
                <span className="text-xs font-medium">
                  {pm.isActive ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onEdit(pm)}>
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  disabled={deletingId === pm.id}
                  onClick={() => onDelete(pm)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isFetching && (
        <div className="flex items-center gap-2 border-t px-4 py-3 text-xs text-muted-foreground">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Actualizando lista...
        </div>
      )}
    </div>
  );
};
