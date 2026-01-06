import { TableColumn } from "@/components/table/types";
import { Expense } from "../types";

export const expenseColumns: TableColumn<Expense>[] = [
  {
    header: "Descripcion",
    cell: (e) => e.description,
    sortable: true,
    sortKey: (e) => e.description,
  },
  {
    header: "Monto",
    cell: (e) => e.amount,
    sortable: true,
    sortKey: (e) => e.amount,
  },
  {
    header: "Fecha",
    cell: (e) => e.date,
    sortable: true,
    sortKey: (e) => e.date,
  },
];

