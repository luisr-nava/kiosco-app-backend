import React, { useEffect } from "react";
import { useEmployeeForm, useEmployeeModals } from "../hooks";
import { Modal } from "@/components/ui/modal";
import EmployeeForm from "./employee-form";

export default function ModalEmployee() {
  const {
    createEmployeeModal,
    editEmployeeModal,
    editEmpoyee,
    openCreate,
    openEdit,
    isEdit,
    closeAll,
  } = useEmployeeModals();
  const openModal = createEmployeeModal.isOpen || editEmployeeModal.isOpen;

  const {
    initialForm,
    reset,
    isLoadingCreate,
    isLoadingUpdate,
    register,
    control,
    errors,
    onSubmit,
  } = useEmployeeForm(editEmpoyee!, () => {
    closeAll();
    reset({ ...initialForm });
  });
  const handleClose = () => {
    closeAll();
    reset({ ...initialForm });
  };

  useEffect(() => {
    if (!editEmpoyee) return;
    reset({
      fullName: editEmpoyee.fullName || "",
      email: editEmpoyee.email || "",
      dni: editEmpoyee.dni || "",
      password: editEmpoyee.password || "",
      phone: editEmpoyee.phone || "",
      address: editEmpoyee.address,
      hireDate: editEmpoyee.hireDate || "",
      salary: editEmpoyee.salary || 0,
      emergencyContact: editEmpoyee.emergencyContact || "",
      profileImage: editEmpoyee.profileImage || "",
      notes: editEmpoyee.notes || "",
    });
  }, [editEmpoyee, reset]);
  console.log(editEmpoyee);

  const isSubmitting = isLoadingCreate || isLoadingUpdate;
  return (
    <Modal
      isOpen={openModal}
      onClose={handleClose}
      title={editEmployeeModal.isOpen ? "Editar empleado" : "Crear empleado"}
      description={"Completa los datos del empleado"}
      size="lg">
      <EmployeeForm
        register={register}
        onSubmit={onSubmit}
        control={control}
        errors={errors}
        onCancel={handleClose}
        isEdit={isEdit}
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
}

