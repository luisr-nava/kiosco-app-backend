import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, Trash2 } from "lucide-react";
import type { MeasurementUnit } from "../interfaces";

interface Props {
  measurementUnits: MeasurementUnit[];
  isLoading: boolean;
  isFetching: boolean;
  onEdit: (unit: MeasurementUnit) => void;
  onDelete: (unit: MeasurementUnit) => void;
  deletingId?: string | null;
}

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

export const MeasurementUnitTable = ({
  measurementUnits,
  isLoading,
  isFetching,
  onEdit,
  onDelete,
  deletingId,
}: Props) => {
  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
        Cargando unidades de medida...
      </div>
    );
  }

  if (!measurementUnits.length) {
    return (
      <p className="text-muted-foreground text-sm">
        No hay unidades de medida registradas.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Nombre</th>
            <th className="px-4 py-3 text-left font-medium">Código</th>
            <th className="px-4 py-3 text-left font-medium">Categoría</th>
            <th className="px-4 py-3 text-left font-medium">Base</th>
            <th className="px-4 py-3 text-left font-medium">Factor</th>
            <th className="px-4 py-3 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {measurementUnits.map((unit) => {
            const locked = unit.isDefault || unit.isBaseUnit;
            const badges: string[] = [];
            if (unit.isDefault) badges.push("Por defecto");
            if (unit.isBaseUnit) badges.push("Base");

            return (
              <tr key={unit.id} className="border-t">
                <td className="px-4 py-3">
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
                </td>
                <td className="px-4 py-3 uppercase">{unit.code}</td>
                <td className="px-4 py-3">
                  {CATEGORY_LABELS[unit.category] || unit.category}
                </td>
                <td className="px-4 py-3">
                  {BASE_UNIT_LABELS[unit.baseUnit] || unit.baseUnit}
                </td>
                <td className="px-4 py-3">
                  {Number(unit.conversionFactor).toLocaleString("es-AR", {
                    maximumFractionDigits: 6,
                  })}
                </td>
                <td className="space-x-2 px-4 py-3 text-right whitespace-nowrap">
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={locked}
                    title={
                      locked
                        ? "Las unidades por defecto o base no pueden editarse"
                        : "Editar unidad"
                    }
                    onClick={() => onEdit(unit)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    disabled={locked || deletingId === unit.id}
                    title={
                      locked
                        ? "Las unidades por defecto o base no pueden eliminarse"
                        : "Eliminar unidad"
                    }
                    onClick={() => onDelete(unit)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {isFetching && (
        <div className="text-muted-foreground flex items-center gap-2 border-t px-4 py-3 text-xs">
          <div className="border-primary h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
          Actualizando lista...
        </div>
      )}
    </div>
  );
};
