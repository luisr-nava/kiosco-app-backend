import { useModal } from "@/features/modal/hooks/useModal";
import { Supplier } from "../types";

export const useSupplierModals = () => {
  const createSupplierModal = useModal("createSupplier");
  const editSupplierModal = useModal<Supplier>("editSupplier");
  const deleteSupplierModal = useModal<Supplier>("deleteSupplier");

  const editSupplier = editSupplierModal.data ?? null;
  const deleteSupplier = deleteSupplierModal.data ?? null;
  const isEdit = Boolean(editSupplier);

  const openCreate = () => {
    createSupplierModal.open();
  };

  const openEdit = (supplier: Supplier) => {
    editSupplierModal.open(supplier);
  };

  const openDelete = (supplier: Supplier) => {
    deleteSupplierModal.open(supplier);
  };

  const closeAll = () => {
    createSupplierModal.close();
    editSupplierModal.close();
    deleteSupplierModal.close();
  };

  return {
    createSupplierModal,
    editSupplierModal,
    deleteSupplierModal,

    editSupplier,
    deleteSupplier,
    isEdit,

    openCreate,
    openEdit,
    openDelete,
    closeAll,
  };
};


