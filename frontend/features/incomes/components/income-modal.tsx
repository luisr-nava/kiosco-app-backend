import { usePaymentMethods } from "@/app/(protected)/settings/payment-method/hooks";
import { Modal } from "@/components/ui/modal";
import React, { useEffect } from "react";
import { useIncomeForm } from "../hooks/useIncomeForm";
import { useIncomeModals } from "../hooks";
import IncomeForm from "./income-form";
import { Button } from "@/components/ui/button";

interface IncomeModalProps {
  cashRegisterId?: string;
  modals: ReturnType<typeof useIncomeModals>;
}
export default function IncomeModal({
  modals,
  cashRegisterId,
}: IncomeModalProps) {
  const {
    createIncomeModal,
    editIncome,
    editIncomeModal,
    deleteIncome,
    deleteIncomeModal,
    isEdit,
    closeAll,
  } = modals;
  const openModal =
    createIncomeModal.isOpen ||
    editIncomeModal.isOpen ||
    deleteIncomeModal.isOpen;

  const {
    form,
    onSubmit,
    isLoadingCreate,
    isLoadingUpdate,
    reset,
    isLoadingDelete,
  } = useIncomeForm(cashRegisterId!, editIncome!, deleteIncome!, isEdit, () => {
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
      title={editIncomeModal.isOpen ? "Editar ingreso" : "Crear ingreso"}
      description={
        editIncomeModal.isOpen || createIncomeModal.isOpen
          ? "Completa los datos del ingreso"
          : ""
      }
      size="lg"
    >
      {deleteIncomeModal.isOpen ? (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            ¿Seguro que deseas eliminar este egreso?
            <span className="block">Esta acción no se puede deshacer.</span>
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoadingDelete}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onSubmit(deleteIncome!);
              }}
              disabled={isLoadingDelete}
            >
              {isLoadingDelete ? "Eliminando..." : "¿Eliminar?"}
            </Button>
          </div>
        </div>
      ) : (
        <IncomeForm
          form={form}
          onSubmit={onSubmit}
          onCancel={handleClose}
          isEdit={isEdit}
          isSubmitting={isSubmitting}
          paymentMethods={paymentMethods}
        />
      )}
    </Modal>
  );
}
