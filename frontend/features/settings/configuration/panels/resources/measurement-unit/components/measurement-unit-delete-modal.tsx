import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

import { useMeasurementUnitModals } from "../hooks/useMeasurementUnitModals";
import { useMeasurementUnitDeleteMutation } from "../hooks/useMeasurementUnitMutations";

interface MeasurementUnitDeleteModalProps {
  modals: ReturnType<typeof useMeasurementUnitModals>;
}

export default function MeasurementUnitDeleteModal({
  modals,
}: MeasurementUnitDeleteModalProps) {
  const { deleteMeasurementUnitModal, deleteMeasurementUnit, closeAll } =
    modals;
  const deleteMutation = useMeasurementUnitDeleteMutation();

  const handleClose = () => {
    if (!deleteMutation.isPending) {
      closeAll();
    }
  };

  const handleDelete = () => {
    if (!deleteMeasurementUnit) {
      return;
    }

    deleteMutation.mutate(deleteMeasurementUnit.id, {
      onSuccess: () => {
        closeAll();
      },
    });
  };

  return (
    <Modal
      isOpen={deleteMeasurementUnitModal.isOpen}
      onClose={handleClose}
      title="Eliminar unidad de medida"
      size="lg"
    >
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          ¿Seguro que deseas eliminar la unidad de medida{" "}
          <span className="font-semibold">
            {deleteMeasurementUnit?.name ?? "seleccionada"}
          </span>
          ? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={deleteMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Eliminando..." : "¿Eliminar?"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
