import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { usePaymentMethodModals } from "../hooks/usePaymentMethodModals";
import { usePaymentMethodDeleteMutation } from "../hooks/usePaymentMethodMutations";
import { toast } from "sonner";

interface PaymentMethodDeleteModalProps {
  modals: ReturnType<typeof usePaymentMethodModals>;
}

export default function PaymentMethodDeleteModal({
  modals,
}: PaymentMethodDeleteModalProps) {
  const { deletePaymentMethodModal, deletePaymentMethod, closeAll } = modals;
  const deleteMutation = usePaymentMethodDeleteMutation();

  const handleClose = () => {
    if (!deleteMutation.isPending) {
      closeAll();
    }
  };

  const handleDelete = () => {
    if (!deletePaymentMethod) {
      return;
    }

    deleteMutation.mutate(deletePaymentMethod.id, {
      onSuccess: () => {
        toast.success("Método de pago eliminado");
        closeAll();
      },
      onError: () => {
        toast.error("No se pudo eliminar el método de pago");
      },
    });
  };

  return (
    <Modal
      isOpen={deletePaymentMethodModal.isOpen}
      onClose={handleClose}
      title="Eliminar método de pago"
      size="lg"
    >
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          ¿Seguro que deseas eliminar el método de pago{" "}
          <span className="font-semibold">
            {deletePaymentMethod?.name ?? "seleccionado"}
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
