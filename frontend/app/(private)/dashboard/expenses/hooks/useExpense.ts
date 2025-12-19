import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { usePaginationParams, useQueryParams } from "@/app/(private)/hooks/useQueryParams";
import { useExpenses } from "./useExpenses";
import { useExpenseMutations } from "./useExpenseMutations";
import type { CreateExpenseDto, Expense } from "../interfaces";

interface UseExpenseParams {
  isOwner: boolean;
  activeShopId?: string | null;
}

export const useExpense = ({ isOwner, activeShopId }: UseExpenseParams) => {
  const {
    search,
    setSearch,
    debouncedSearch,
    page,
    limit,
    setPage,
    setLimit,
    updateParams,
  } = usePaginationParams(300);

  const { params } = useQueryParams();

  const startDateParam = (params.startDate as string) || "";
  const endDateParam = (params.endDate as string) || "";

  const [startDate, setStartDateState] = useState<string>(startDateParam);
  const [endDate, setEndDateState] = useState<string>(endDateParam);
  const [dateError, setDateError] = useState<string>("");

  const { expenses, pagination, expensesLoading, isFetching } = useExpenses(
    debouncedSearch,
    page,
    limit,
    isOwner && Boolean(activeShopId),
    startDate || undefined,
    endDate || undefined,
  );

  const { createMutation, updateMutation, deleteMutation } =
    useExpenseMutations();

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const deletingId = useMemo(
    () =>
      deleteMutation.isPending && deleteMutation.variables
        ? (deleteMutation.variables as string)
        : null,
    [deleteMutation.isPending, deleteMutation.variables],
  );

  const handleSubmit = (values: {
    description: string;
    amount: number;
    date: string;
    paymentMethodId?: string;
    category?: string | null;
  }) => {
    if (!activeShopId) {
      toast.error("Selecciona una tienda para gestionar gastos.");
      return;
    }

    const payload: CreateExpenseDto = {
      description: values.description.trim(),
      amount: Number(values.amount),
      date: values.date,
      paymentMethodId: values.paymentMethodId?.trim() || null,
      category: values.category?.trim() || null,
      shopId: activeShopId,
    };

    if (editingExpense) {
      updateMutation.mutate(
        { id: editingExpense.id, payload },
        {
          onSuccess: () => {
            setEditingExpense(null);
            setIsModalOpen(false);
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setEditingExpense(null);
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleOpenCreate = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setIsModalOpen(false);
  };

  const handleDelete = (expense: Expense) => setDeleteTarget(expense);
  const closeDeleteModal = () => setDeleteTarget(null);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        if (editingExpense?.id === deleteTarget.id) {
          setEditingExpense(null);
        }
        closeDeleteModal();
      },
    });
  };

  const isValidRange = (from: string, to: string) => {
    if (!from || !to) return true;
    return new Date(from) <= new Date(to);
  };

  const setStartDate = (value: string) => {
    const nextFrom = value;
    const nextTo = endDate;
    if (!isValidRange(nextFrom, nextTo)) {
      setDateError("La fecha 'Desde' no puede ser mayor a 'Hasta'.");
      return;
    }
    setDateError("");
    setStartDateState(nextFrom);
    updateParams({ startDate: nextFrom || undefined, page: 1 });
  };

  const setEndDate = (value: string) => {
    const nextFrom = startDate;
    const nextTo = value;
    if (!isValidRange(nextFrom, nextTo)) {
      setDateError("La fecha 'Hasta' no puede ser menor a 'Desde'.");
      return;
    }
    setDateError("");
    setEndDateState(nextTo);
    updateParams({ endDate: nextTo || undefined, page: 1 });
  };

  useEffect(() => {
    setStartDateState(startDateParam);
  }, [startDateParam]);

  useEffect(() => {
    setEndDateState(endDateParam);
  }, [endDateParam]);

  useEffect(() => {
    if (!pagination) return;
    const maxPage = Math.max(pagination.totalPages, 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, pagination, setPage]);

  return {
    // filters/pagination
    search,
    setSearch,
    debouncedSearch,
    page,
    limit,
    setPage,
    setLimit,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    dateError,
    pagination,
    // data
    expenses,
    expensesLoading,
    isFetching,
    // modal/state
    isModalOpen,
    editingExpense,
    deleteTarget,
    deletingId,
    // handlers
    handleSubmit,
    handleOpenCreate,
    handleEdit,
    handleCancelEdit,
    handleDelete,
    closeDeleteModal,
    confirmDelete,
    // mutations
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
