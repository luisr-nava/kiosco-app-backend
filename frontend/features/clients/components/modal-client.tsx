import { Modal } from "@/components/ui/modal";
import { useCustomerForm, useCustomerModals } from "../hooks";
import CustomerForm from "./customer-form";
import { Button } from "@/components/ui/button";

export default function ModalClient() {
  const {
    createCustomerModal,
    editCustomer,
    editCustomerModal,
    deleteCustomerModal,
    deleteCustomer,
    isEdit,
    closeAll,
  } = useCustomerModals();
  const openModal =
    createCustomerModal.isOpen ||
    editCustomerModal.isOpen ||
    deleteCustomerModal.isOpen;

  const {
    initialForm,
    reset,
    isLoadingCreate,
    isLoadingUpdate,
    isLoadingDelete,
    register,
    control,
    errors,
    onSubmit,
  } = useCustomerForm(editCustomer!, deleteCustomer!, () => {
    closeAll();
    reset({ ...initialForm });
  });

  const handleClose = () => {
    closeAll();
    reset({ ...initialForm });
  };

  const isSubmitting = isLoadingCreate || isLoadingUpdate || isLoadingDelete;

  return (
    <Modal
      isOpen={openModal}
      onClose={handleClose}
      title={
        editCustomerModal.isOpen
          ? "Editar cliente"
          : deleteCustomer
          ? "Eliminar cliente"
          : "Crear cliente"
      }
      description={
        editCustomerModal.isOpen || createCustomerModal.isOpen
          ? "Completa los datos del cliente"
          : ""
      }
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
              onClick={onSubmit}
              disabled={isLoadingDelete}>
              {isLoadingDelete ? "Eliminando..." : "¿Eliminar?"}
            </Button>
          </div>
        </div>
      ) : (
        <CustomerForm
          register={register}
          onSubmit={onSubmit}
          control={control}
          errors={errors}
          onCancel={handleClose}
          isEdit={isEdit}
          isSubmitting={isSubmitting}
        />
      )}
    </Modal>
  );
}

