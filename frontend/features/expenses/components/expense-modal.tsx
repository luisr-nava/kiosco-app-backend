import { Modal } from "@/components/ui/modal";
import { useEffect } from "react";
import { useExpenseForm, useExpenseModals } from "../hooks";
import ExpenseForm from "./expense-form";
import { usePaymentMethods } from "@/app/(protected)/settings/payment-method/hooks";

interface ExpenseModalProps {
  cashRegisterId?: string;
  modals: ReturnType<typeof useExpenseModals>;
}
export default function ExpenseModal({ cashRegisterId, modals }: ExpenseModalProps) {
  const {
    createExpenseModal,
    editExpense,
    editExpenseModal,
    deleteExpense,
    deleteExpenseModal,
    isEdit,
    closeAll,
  } = modals;
  const openModal = createExpenseModal.isOpen || editExpenseModal.isOpen;

  const { form, onSubmit, isLoadingCreate, isLoadingUpdate, reset, isLoadingDelete } =
    useExpenseForm(cashRegisterId!, editExpense!, deleteExpense!, isEdit, () => {
      closeAll();
    });

  const handleClose = () => {
    closeAll();
    reset();
  };

  const isSubmitting = isLoadingCreate || isLoadingUpdate || isLoadingDelete;
  const { paymentMethods } = usePaymentMethods();

  return (
    <Modal
      isOpen={openModal}
      onClose={handleClose}
      title={editExpenseModal.isOpen ? "Editar egreso" : "Crear egreso"}
      description={
        editExpenseModal.isOpen || createExpenseModal.isOpen ? "Completa los datos del egreso" : ""
      }
      size="lg"
    >
      <ExpenseForm
        form={form}
        onSubmit={onSubmit}
        onCancel={handleClose}
        isEdit={isEdit}
        isSubmitting={isSubmitting}
        paymentMethods={paymentMethods}
      />
    </Modal>
  );
}
