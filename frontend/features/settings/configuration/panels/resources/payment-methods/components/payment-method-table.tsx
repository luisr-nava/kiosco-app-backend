import type { UIEvent } from "react";
import { PaymentMethod } from "../types";
import { BaseTable } from "@/components/table/BaseTable";
import { usePaymentMethodColumns } from "./payment-method.columns";

interface Props {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  onEdit: (pm: PaymentMethod) => void;
  onDelete: (pm: PaymentMethod) => void;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

export const PaymentMethodTable = ({
  paymentMethods,
  loading,
  onEdit,
  onDelete,
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
    <div className="min-w-0 overflow-hidden">
      {/* <div className="min-h-0 flex-1 overflow-auto" onScroll={handleScroll}> */}
      <BaseTable<PaymentMethod>
        data={paymentMethods}
        getRowId={(e) => e.id}
        columns={paymentColums}
        stickyHeader
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
    </div>
  );
};
