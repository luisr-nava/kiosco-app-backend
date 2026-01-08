import { TableColumn } from "@/components/table/types";
import { Income } from "../types";
import { useCurrencyFormatter } from "@/src/hooks/useCurrencyFormatter";
import { formatDate } from "@/utils";

export function useIncomeColumns(): TableColumn<Income>[] {
  const formatCurrency = useCurrencyFormatter(0);

  return [
    {
      header: "Descripción",
      cell: (e) => e.description,
      sortable: true,
      sortKey: (e) => e.description,
    },
    {
      header: "Monto",
      cell: (e) => formatCurrency(e.amount),
      sortable: true,
      sortKey: (e) => e.amount,
    },
    {
      header: "Fecha",
      cell: (e) => formatDate(e.date),
      sortable: true,
      sortKey: (e) => e.date,
    },
    {
      header: "Método de pago",
      cell: (e) => e.paymentMethod?.name ?? "Sin método",
      sortable: true,
      sortKey: (e) => e.paymentMethod?.name ?? "",
    },
  ];
}
