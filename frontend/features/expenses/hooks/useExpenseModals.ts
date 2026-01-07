import { useModal } from "@/features/modal/hooks/useModal";
import { Expense } from "../types";

export const useExpenseModals = () => {
  const createExpenseModal = useModal("createExpense");
  const editExpenseModal = useModal<Expense>("editExpense");
  const deleteExpenseModal = useModal<Expense>("deleteExpense");

  const editExpense = editExpenseModal.data ?? null;
  const deleteExpense = deleteExpenseModal.data ?? null;
  const isEdit = Boolean(editExpense);

  const openCreate = () => {
    createExpenseModal.open();
  };

  const openEdit = (expense: Expense) => {
    editExpenseModal.open(expense);
  };

  const openDelete = (expense: Expense) => {
    deleteExpenseModal.open(expense);
  };

  const closeAll = () => {
    createExpenseModal.close();
    editExpenseModal.close();
    deleteExpenseModal.close();
  };

  return {
    createExpenseModal,
    editExpenseModal,
    deleteExpenseModal,

    editExpense,
    deleteExpense,
    isEdit,

    openCreate,
    openEdit,
    openDelete,
    closeAll,
  };
};
