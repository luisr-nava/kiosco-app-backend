import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";
import { MeasurementUnitForm } from "./measurement-unit-form";
import { MeasurementUnitTable } from "./measurement-unit-table";
import type {
  MeasurementBaseUnit,
  MeasurementUnit,
  MeasurementUnitCategory,
} from "../interfaces";
import { useMeasurementUnits } from "../hooks/useMeasurementUnits";
import { useMeasurementUnitMutations } from "../hooks/useMeasurementUnitMutations";
import { useMeasurementUnitModals } from "../hooks/useMeasurementUnitModals";
import MeasurementUnitDeleteModal from "./measurement-unit-delete-modal";
import { useShopStore } from "@/features/shop/shop.store";

const BASE_UNIT_BY_CATEGORY: Record<
  MeasurementUnitCategory,
  MeasurementBaseUnit
> = {
  UNIT: "UNIT",
  WEIGHT: "KG",
  VOLUME: "L",
};

export default function MeasurementUnitPanel() {
  const { activeShopId } = useShopStore();
  const modals = useMeasurementUnitModals();
  const { measurementUnits, isFetching } = useMeasurementUnits();
  const { createMutation, updateMutation } = useMeasurementUnitMutations();

  const [editingUnit, setEditingUnit] = useState<MeasurementUnit | null>(null);

  const handleCancelEdit = () => {
    setEditingUnit(null);
  };

  return (
    <>
      <Card className="max-h-90 min-h-90">
        <CardContent className="flex h-full min-h-0 flex-col gap-6">
          <MeasurementUnitForm
            onSubmit={(values) => {
              if (!activeShopId) return;

              const payload = {
                name: values.name,
                code: values.code.toUpperCase(),
                category: values.category,
                baseUnit: BASE_UNIT_BY_CATEGORY[values.category],
                conversionFactor: values.conversionFactor,
              };

              if (editingUnit) {
                updateMutation.mutate(
                  { id: editingUnit.id, payload },
                  { onSuccess: () => setEditingUnit(null) }
                );
                return;
              }

              createMutation.mutate(
                { ...payload, shopIds: [activeShopId] },
                { onSuccess: () => setEditingUnit(null) }
              );
            }}
            isSubmitting={
              editingUnit
                ? updateMutation.isPending
                : createMutation.isPending
            }
            editing={editingUnit}
            onCancelEdit={handleCancelEdit}
            disabled={!activeShopId}
          />
          <MeasurementUnitTable
            measurementUnits={measurementUnits}
            loading={isFetching}
            onEdit={(unit) => setEditingUnit(unit)}
            onDelete={(unit) => modals.openDelete(unit)}
          />
        </CardContent>
      </Card>
      <MeasurementUnitDeleteModal modals={modals} />
    </>
  );
}
