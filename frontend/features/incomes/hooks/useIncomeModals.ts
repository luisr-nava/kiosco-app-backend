import { useModal } from "@/features/modal/hooks/useModal";
import { Income } from "../types";

export const useIncomeModals = () => {
  const createIncomeModal = useModal("createIncome");
  const editIncomeModal = useModal<Income>("editIncome");
  const deleteIncomeModal = useModal<Income>("deleteIncome");

  const editIncome = editIncomeModal.data ?? null;
  const deleteIncome = deleteIncomeModal.data ?? null;
  const isEdit = Boolean(editIncome);

  const openCreate = () => {
    createIncomeModal.open();
  };

  const openEdit = (income: Income) => {
    editIncomeModal.open(income);
  };

  const openDelete = (income: Income) => {
    deleteIncomeModal.open(income);
  };

  const closeAll = () => {
    createIncomeModal.close();
    editIncomeModal.close();
    deleteIncomeModal.close();
  };

  return {
    createIncomeModal,
    editIncomeModal,
    deleteIncomeModal,

    editIncome,
    deleteIncome,
    isEdit,

    openCreate,
    openEdit,
    openDelete,
    closeAll,
  };
};




