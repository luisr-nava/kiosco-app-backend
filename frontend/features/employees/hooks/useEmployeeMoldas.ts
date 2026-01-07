import { useModal } from "@/features/modal/hooks/useModal";
import { Employee } from "../types";

export const useEmployeeModals = () => {
  const createEmployeeModal = useModal("createEmployee");
  const editEmployeeModal = useModal<Employee>("editEmployee");
  const editEmployee = editEmployeeModal.data ?? null;
  const isEdit = Boolean(editEmployee);

  const openCreate = () => {
    createEmployeeModal.open();
  };

  const openEdit = (employee: Employee) => {
    editEmployeeModal.open(employee);
  };

  const closeAll = () => {
    createEmployeeModal.close();
    editEmployeeModal.close();
  };

  return {
    createEmployeeModal,
    editEmployeeModal,

    editEmployee,
    isEdit,

    openCreate,
    openEdit,
    closeAll,
  };
};
