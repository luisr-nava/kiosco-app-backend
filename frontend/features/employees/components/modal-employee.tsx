import { useEmployeeForm, useEmployeeModals } from "../hooks";
import EmployeeForm from "./employee-form";
import { BaseFormModal } from "@/components/modal/BaseFormModal";
interface ModalEmployeeProps {
  modals: ReturnType<typeof useEmployeeModals>;
}
export default function ModalEmployee({ modals }: ModalEmployeeProps) {
  const {
    createEmployeeModal,
    editEmployeeModal,
    editEmployee,
    isEdit,
    closeAll,
  } = modals;
  const openModal = createEmployeeModal.isOpen || editEmployeeModal.isOpen;

  const { form, onSubmit, isLoadingCreate, isLoadingUpdate, reset } =
    useEmployeeForm(editEmployee!, isEdit, () => {
      closeAll();
      reset();
    });
  const handleClose = () => {
    closeAll();
    reset();
  };

  const isSubmitting = isLoadingCreate || isLoadingUpdate;
  return (
    <BaseFormModal
      isOpen={openModal}
      title={isEdit ? "Editar empleado" : "Crear empleado"}
      description="Completa los datos del empleado"
      size="lg"
      isSubmitting={isSubmitting}
      onClose={handleClose}>
      <EmployeeForm
        form={form}
        onSubmit={onSubmit}
        onCancel={handleClose}
        isEdit={isEdit}
        isSubmitting={isLoadingCreate || isLoadingUpdate}
      />
    </BaseFormModal>
  );
}

