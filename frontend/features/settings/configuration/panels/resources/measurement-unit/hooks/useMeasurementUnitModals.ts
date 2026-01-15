import { useModal } from "@/features/modal/hooks/useModal";
import type { MeasurementUnit } from "../types";

export const useMeasurementUnitModals = () => {
  const deleteMeasurementUnitModal = useModal<MeasurementUnit>(
    "deleteMeasurementUnit"
  );

  const deleteMeasurementUnit = deleteMeasurementUnitModal.data ?? null;

  const openDelete = (unit: MeasurementUnit) => {
    deleteMeasurementUnitModal.open(unit);
  };

  const closeAll = () => {
    deleteMeasurementUnitModal.close();
  };

  return {
    deleteMeasurementUnitModal,
    deleteMeasurementUnit,
    openDelete,
    closeAll,
  };
};
