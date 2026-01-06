import { Modal } from "@/components/ui/modal";
import { useCustomerForm, useCustomerModals } from "../hooks";
import CustomerForm from "./customer-form";
import { Button } from "@/components/ui/button";
interface ModalCustomerProps {
  modals: ReturnType<typeof useCustomerModals>;
}
export default function ModalClient({ modals }: ModalCustomerProps) {
  const {
    createCustomerModal,
    editCustomer,
    editCustomerModal,
    deleteCustomerModal,
    deleteCustomer,
    isEdit,
    closeAll,
  } = modals;

  const openModal =
    createCustomerModal.isOpen ||
    editCustomerModal.isOpen ||
    deleteCustomerModal.isOpen;

  const {
    form,
    isLoadingCreate,
    isLoadingUpdate,
    onSubmit,
    reset,
    isLoadingDelete,
  } = useCustomerForm(editCustomer!, deleteCustomer!, isEdit, () => {
    closeAll();
  });

  const handleClose = () => {
    closeAll();
    reset();
  };

  const isSubmitting = isLoadingCreate || isLoadingUpdate;
  const title = editCustomerModal.isOpen
    ? "Editar cliente"
    : deleteCustomer
    ? "Eliminar cliente"
    : "Crear cliente";
  const description =
    editCustomerModal.isOpen || createCustomerModal.isOpen
      ? "Completa los datos del cliente"
      : "";
  return (
    <Modal
      isOpen={openModal}
      onClose={handleClose}
      title={title}
      description={description}
      size="lg">
      {deleteCustomerModal.isOpen ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            ¿Seguro que deseas eliminar a{" "}
            <span className="font-semibold">
              {deleteCustomerModal.data?.fullName}
            </span>
            ? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoadingDelete}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onSubmit(deleteCustomer!);
              }}
              disabled={isLoadingDelete}>
              {isLoadingDelete ? "Eliminando..." : "¿Eliminar?"}
            </Button>
          </div>
        </div>
      ) : (
        <CustomerForm
          form={form}
          onSubmit={onSubmit}
          onCancel={handleClose}
          isEdit={isEdit}
          isSubmitting={isSubmitting}
        />
      )}
    </Modal>
  );
}

