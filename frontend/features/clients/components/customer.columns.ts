import { TableColumn } from "@/components/table/types";
import { Customer } from "../types";

export const customersColumns: TableColumn<Customer>[] = [
  {
    header: "Nombre",
    cell: (e) => e.fullName,
    sortable: true,
    sortKey: (e) => e.fullName.toLowerCase(),
  },
  {
    header: "Email",
    cell: (e) => e.email,
    sortable: true,
    sortKey: (e) => e.email,
  },
  {
    header: "Teléfono",
    cell: (e) => e.phone,
    sortable: true,
    sortKey: (e) => e.phone,
  },
];

