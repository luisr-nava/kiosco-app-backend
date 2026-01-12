import { TableColumn } from "@/components/table/types";

import { useCurrencyFormatter } from "@/src/hooks/useCurrencyFormatter";
import { formatDate } from "@/utils";
import { SaleHistory } from "../types";

export function useSaleColumns(): TableColumn<SaleHistory>[] {
  const formatCurrency = useCurrencyFormatter(0);
  const PAYMENT_STATUS_LABELS: Record<
    "PAID" | "PENDING" | "CANCELLED",
    string
  > = {
    PAID: "Pagado",
    PENDING: "Pendiente",
    CANCELLED: "Cancelado",
  };

  const SALE_STATUS_LABELS: Record<"COMPLETED" | "CANCELLED", string> = {
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
  };
  return [
    {
      header: "Fecha",
      cell: (e) => formatDate(e.saleDate),
      sortable: true,
      sortKey: (e) => e.saleDate,
    },
    {
      header: "Total de Items",
      cell: (e) => e.items.length,
      align: "center",
    },
    {
      header: "Estado del pago",
      cell: (e) =>
        PAYMENT_STATUS_LABELS[
          e.paymentStatus as keyof typeof PAYMENT_STATUS_LABELS
        ],
      sortable: true,
      sortKey: (e) => e.paymentStatus,
      align: "center",
    },
    {
      header: "Total",
      cell: (e) => formatCurrency(e.totalAmount!),
      sortable: true,
      sortKey: (e) => e.totalAmount!,
      align: "center",
    },
    {
      header: "Edición",
      cell: (e) =>
        e.changesSummary?.wasEdited ? "Modificada" : "Sin modificar",
      sortable: true,
      sortKey: (e) => (e.changesSummary?.wasEdited ? 1 : 0),
      align: "center",
    },
    {
      header: "Estado de la venta",
      cell: (e) =>
        SALE_STATUS_LABELS[e.status as keyof typeof SALE_STATUS_LABELS],
      sortable: true,
      sortKey: (e) => e.status,
      align: "center",
    },
    {
      header: "Última edición",
      cell: (e) =>
        e.changesSummary?.lastEditedAt
          ? formatDate(e.changesSummary.lastEditedAt)
          : "-",
      sortable: true,
      sortKey: (e) => e.changesSummary?.lastEditedAt ?? "",
      align: "center",
    },
  ];
}
