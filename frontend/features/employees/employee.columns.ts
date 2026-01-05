import { TableColumn } from "@/components/table/types";
import { Employee } from "./types";

export const employeeColumns: TableColumn<Employee>[] = [
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
    sortKey: (e) => e.email.toLowerCase(),
  },
  {
    header: "Telefono",
    cell: (e) => e.phone,
    sortable: true,
    sortKey: (e) => e.phone?.toLowerCase() || "",
  },
];

