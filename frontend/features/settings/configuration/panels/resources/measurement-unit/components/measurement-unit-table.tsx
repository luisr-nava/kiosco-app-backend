import type { UIEvent } from "react";
import type { MeasurementUnit } from "../interfaces";
import { BaseTable } from "@/components/table/BaseTable";
import { useMeasurementUnitColumns } from "./measurement-unit.columns";

interface Props {
  measurementUnits: MeasurementUnit[];
  loading: boolean;
  onEdit: (unit: MeasurementUnit) => void;
  onDelete: (unit: MeasurementUnit) => void;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  deletingId?: string | null;
}

export const MeasurementUnitTable = ({
  measurementUnits,
  loading,
  onEdit,
  onDelete,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  deletingId,
}: Props) => {
  if (!measurementUnits.length) {
    return (
      <p className="text-muted-foreground text-sm">
        No hay unidades de medida registradas.
      </p>
    );
  }

  const columns = useMeasurementUnitColumns();
  const isLocked = (unit: MeasurementUnit) =>
    unit.isDefault || unit.isBaseUnit;

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!hasNextPage || isFetchingNextPage || loading) return;

    const el = event.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
      fetchNextPage?.();
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border">
      <div className="min-h-0 flex-1 overflow-y-auto" onScroll={handleScroll}>
        <BaseTable<MeasurementUnit>
          data={measurementUnits}
          getRowId={(e) => e.id}
          columns={columns}
          stickyHeader
          actions={(unit) => [
            {
              type: "edit",
              onClick: () => onEdit(unit),
              disabled: (row) => isLocked(row),
            },
            {
              type: "delete",
              onClick: () => onDelete(unit),
              disabled: (row) => isLocked(row) || deletingId === row.id,
            },
          ]}
        />
        {isFetchingNextPage && (
          <div className="text-muted-foreground flex items-center justify-center gap-2 border-t px-4 py-3 text-xs">
            <div className="border-primary h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
            Cargando más unidades de medida...
          </div>
        )}
      </div>
      {loading && (
        <div className="text-muted-foreground flex items-center gap-2 border-t px-4 py-3 text-xs">
          <div className="border-primary h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
          Actualizando lista...
        </div>
      )}
    </div>
  );
};
