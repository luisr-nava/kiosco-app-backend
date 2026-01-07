import { usePaymentMethods } from "@/app/(protected)/settings/payment-method/hooks";
import { Modal } from "@/components/ui/modal";
import React, { useEffect } from "react";
import { useIncomeForm } from "../hooks/useIncomeForm";
import { useIncomeModals } from "../hooks";
import IncomeForm from "./income-form";

export default function ModalIncome() {
  const {
    createIncomeModal,
    editIncome,
    editIncomeModal,
    deleteIncome,
    deleteIncomeModal,
    isEdit,
    closeAll,
  } = useIncomeModals();
  const openModal = createIncomeModal.isOpen || editIncomeModal.isOpen;

  const {
    initialForm,
    reset,
    isLoadingCreate,
    isLoadingUpdate,
    isLoadingDelete,
    register,
    isValid,
    control,
    errors,
    onSubmit,
  } = useIncomeForm(editIncome!, deleteIncome!, () => {
    closeAll();
    reset({ ...initialForm });
  });

  const handleClose = () => {
    closeAll();
    reset({ ...initialForm });
  };

  const isSubmitting = isLoadingCreate || isLoadingUpdate || isLoadingDelete;
  const { paymentMethods } = usePaymentMethods();
  useEffect(() => {
    if (!editIncome) return;
    reset({
      description: editIncome.description || "",
      amount: editIncome.amount || 0,
      paymentMethodId: editIncome.paymentMethodId || "",
      date: editIncome.date || "",
    });
  }, [editIncome, reset]);
  return (
    <Modal
      isOpen={openModal}
      onClose={handleClose}
      title={editIncomeModal.isOpen ? "Editar ingreso" : "Crear ingreso"}
      description={
        editIncomeModal.isOpen || createIncomeModal.isOpen ? "Completa los datos del ingreso" : ""
      }
      size="lg"
    >
      <IncomeForm
        register={register}
        onSubmit={onSubmit}
        control={control}
        errors={errors}
        onCancel={handleClose}
        isEdit={isEdit}
        isSubmitting={isSubmitting}
        paymentMethods={paymentMethods}
        isValid={isValid}
      />
    </Modal>
  );
}
