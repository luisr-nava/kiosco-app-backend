import { Badge } from "@/components/ui/badge";
import { TableColumn } from "@/components/table/types";
import type { MeasurementUnit } from "../interfaces";

const CATEGORY_LABELS: Record<MeasurementUnit["category"], string> = {
  UNIT: "Unidades",
  WEIGHT: "Peso",
  VOLUME: "Volumen",
};

const BASE_UNIT_LABELS: Record<MeasurementUnit["baseUnit"], string> = {
  UNIT: "Unidad",
  KG: "Kilogramo",
  L: "Litro",
};

const formatConversionFactor = (value: number) =>
  Number(value).toLocaleString("es-AR", {
    maximumFractionDigits: 6,
  });

export function useMeasurementUnitColumns(): TableColumn<MeasurementUnit>[] {
  return [
    {
      header: "Nombre",
      cell: (unit) => {
        const badges: string[] = [];
        if (unit.isDefault) badges.push("Por defecto");
        if (unit.isBaseUnit) badges.push("Base");

        return (
          <div className="flex flex-wrap items-center gap-2">
            <span>{unit.name}</span>
            {badges.map((badge) => (
              <Badge
                key={badge}
                variant={badge === "Base" ? "secondary" : "outline"}
              >
                {badge}
              </Badge>
            ))}
          </div>
        );
      },
      sortable: true,
      sortKey: (unit) => unit.name,
    },
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
