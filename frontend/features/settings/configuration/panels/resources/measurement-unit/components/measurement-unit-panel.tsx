import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { MeasurementUnitForm } from "./measurement-unit-form";
import { MeasurementUnitTable } from "./measurement-unit-table";
import type { MeasurementUnit } from "../types";
import { useMeasurementUnits } from "../hooks/useMeasurementUnits";
import { useMeasurementUnitModals } from "../hooks/useMeasurementUnitModals";
import MeasurementUnitDeleteModal from "./measurement-unit-delete-modal";
import { useShopStore } from "@/features/shop/shop.store";
import { Skeleton } from "@/components/ui/skeleton";
import { useMeasurementUnitsForm } from "../hooks";

export default function MeasurementUnitPanel() {
  const { activeShopId } = useShopStore();
  const modals = useMeasurementUnitModals();
  const {
    measurementUnits,
    pagination,
    isLoadingMeasurement,
    isFetching,
    fetchNextMeasurement,
    hasMoreMeasurement,
    isFetchingNextMeasurement,
  } = useMeasurementUnits();

  const [editingUnit, setEditingUnit] = useState<MeasurementUnit | null>(null);

  const handleCancelEdit = () => {
    setEditingUnit(null);
  };
  const { form, onSubmit, isLoading, isEditing } = useMeasurementUnitsForm(
    editingUnit!,
    handleCancelEdit
  );
  return (
    <>
      <Card className="max-h-90 min-h-90">
        {isLoadingMeasurement ? (
          <div className="mx-10 grid gap-5">
            <Skeleton className="h-5 w-full rounded-full" />
            <Skeleton className="h-5 w-full rounded-full" />
            <Skeleton className="h-5 w-full rounded-full" />
            <Skeleton className="h-5 w-full rounded-full" />
          </div>
        ) : (
          <CardContent className="flex h-full min-h-0 flex-col gap-6">
            <MeasurementUnitForm
              form={form}
              onSubmit={onSubmit}
              isEditing={isEditing}
              pending={isLoading}
              handleCancelEdit={handleCancelEdit}
            />
            <MeasurementUnitTable
              measurementUnits={measurementUnits}
              loading={isFetching}
              onEdit={(unit) => setEditingUnit(unit)}
              onDelete={(unit) => modals.openDelete(unit)}
            />
          </CardContent>
        )}
      </Card>
      <MeasurementUnitDeleteModal modals={modals} />
    </>
  );
}
