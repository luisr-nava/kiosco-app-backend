import type { UIEvent } from "react";
import { PaymentMethod } from "../types";
import { BaseTable } from "@/components/table/BaseTable";
import { usePaymentMethodColumns } from "./payment-method.columns";

interface Props {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  onEdit: (pm: PaymentMethod) => void;
  onDelete: (pm: PaymentMethod) => void;
  deletingId?: string | null;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

export const PaymentMethodTable = ({
  paymentMethods,
  loading,
  onEdit,
  onDelete,
  deletingId,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: Props) => {
  if (!paymentMethods.length) {
    return (
      <p className="text-muted-foreground text-sm">
        No hay métodos de pago registrados.
      </p>
    );
  }
  const paymentColums = usePaymentMethodColumns();

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!hasNextPage || isFetchingNextPage || loading) return;

    const el = event.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
      fetchNextPage?.();
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border">
      <div className="min-h-0 flex-1 overflow-y-auto" onScroll={handleScroll}>
        <BaseTable<PaymentMethod>
          data={paymentMethods}
          getRowId={(e) => e.id}
          columns={paymentColums}
          actions={(e) => [
            {
              type: "edit",
              onClick: () => onEdit(e),
            },
            {
              type: "delete",
              onClick: () => onDelete(e),
            },
          ]}
        />
        {isFetchingNextPage && (
          <div className="text-muted-foreground flex items-center justify-center gap-2 border-t px-4 py-3 text-xs">
            <div className="border-primary h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
            Cargando más métodos de pago...
          </div>
        )}
      </div>
      {loading && (
        <div className="text-muted-foreground flex items-center gap-2 border-t px-4 py-3 text-xs">
          <div className="border-primary h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
          Actualizando lista...
        </div>
      )}
    </div>
  );
};
