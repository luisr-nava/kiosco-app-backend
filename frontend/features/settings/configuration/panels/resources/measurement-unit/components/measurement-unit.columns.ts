import { Badge } from "@/components/ui/badge";
import { TableColumn } from "@/components/table/types";
import type { MeasurementUnit } from "../types";

export function useMeasurementUnitColumns(): TableColumn<MeasurementUnit>[] {
  return [
    {
      header: "Nombre",
      cell: (unit) => unit.name,
      sortable: true,
      sortKey: (unit) => unit.name,
      align: "left",
    },
    {
      header: "Código",
      cell: (unit) => unit.code,
      sortable: true,
      sortKey: (unit) => unit.code,
      align: "center",
    },
  ];
}
