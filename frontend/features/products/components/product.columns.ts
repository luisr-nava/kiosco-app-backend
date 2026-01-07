import { TableColumn } from "@/components/table/types";
import { Product } from "../types";

export const productColumns: TableColumn<Product>[] = [
  {
    header: "Nombre",
    cell: (e) => e.name,
    sortable: true,
    sortKey: (e) => e.name.toLowerCase(),
  },
  {
    header: "Código",
    cell: (e) => e.barcode,
    sortable: true,
    sortKey: (e) => e.barcode!,
  },
  {
    header: "Stock",
    cell: (e) => e.stock,
    sortable: true,
    sortKey: (e) => e.stock,
  },
  {
    header: "Precio",
    cell: (e) => e.salePrice,
    sortable: true,
    sortKey: (e) => e.salePrice,
  },
  {
    header: "Estado",
    cell: (e) => (e.isActive ? "Activo" : "Desactivado"),
    sortable: true,
    sortKey: (e) => (e.isActive ? "Activo" : "Desactivado"),
  },
];
