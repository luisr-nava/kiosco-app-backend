import { Badge } from "@/components/ui/badge";
import { TableColumn } from "@/components/table/types";
import type { MeasurementUnit } from "../interfaces";

interface CategoryLabels extends Record<MeasurementUnit["category"], string> {}

interface BaseUnitLabels extends Record<MeasurementUnit["baseUnit"], string> {}

const CATEGORY_LABELS: CategoryLabels = {
  UNIT: "Unidades",
  WEIGHT: "Peso",
  VOLUME: "Volumen",
};

const BASE_UNIT_LABELS: BaseUnitLabels = {
  UNIT: "Unidad",
  KG: "Kilogramo",
  L: "Litro",
};

const formatConversionFactor = (value: number): string =>
  Number(value).toLocaleString("es-AR", {
    maximumFractionDigits: 6,
  });

export function useMeasurementUnitColumns(): TableColumn<MeasurementUnit>[] {
  return [
    {
      header: "Código",
      cell: (unit) => unit.code.toUpperCase(),
      sortable: true,
      sortKey: (unit) => unit.code,
      align: "center",
    },
    {
      header: "Categoría",
      cell: (unit) => CATEGORY_LABELS[unit.category] || unit.category,
      sortable: true,
      sortKey: (unit) => CATEGORY_LABELS[unit.category] || unit.category,
      align: "center",
    },
    {
      header: "Base",
      cell: (unit) => BASE_UNIT_LABELS[unit.baseUnit] || unit.baseUnit,
      sortable: true,
      sortKey: (unit) => BASE_UNIT_LABELS[unit.baseUnit] || unit.baseUnit,
      align: "center",
    },
    {
      header: "Factor",
      cell: (unit) => formatConversionFactor(unit.conversionFactor),
      sortable: true,
      sortKey: (unit) => Number(unit.conversionFactor) || 0,
      align: "center",
    },
  ];
}
