import { useModal } from "@/features/modal/hooks/useModal";
import { Customer } from "../types";

export const useCustomerModals = () => {
  const createCustomerModal = useModal("createCustomer");
  const editCustomerModal = useModal<Customer>("editCustomer");
  const deleteCustomerModal = useModal<Customer>("deleteCustomer");

  const editCustomer = editCustomerModal.data ?? null;
  const deleteCustomer = deleteCustomerModal.data ?? null;
  const isEdit = Boolean(editCustomer);

  const openCreate = () => {
    createCustomerModal.open();
  };

  const openEdit = (customer: Customer) => {
    editCustomerModal.open(customer);
  };

  const openDelete = (customer: Customer) => {
    deleteCustomerModal.open(customer);
  };

  const closeAll = () => {
    createCustomerModal.close();
    editCustomerModal.close();
    deleteCustomerModal.close();
  };

  return {
    createCustomerModal,
    editCustomerModal,
    deleteCustomerModal,

    editCustomer,
    deleteCustomer,
    isEdit,

    openCreate,
    openEdit,
    openDelete,
    closeAll,
  };
};
