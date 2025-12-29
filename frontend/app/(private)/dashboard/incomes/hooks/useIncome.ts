import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  usePaginationParams,
  useQueryParams,
} from "@/app/(private)/hooks/useQueryParams";
import { useIncomes } from "./useIncomes";
import { useIncomeMutations } from "./useIncomeMutations";
import type { CreateIncomeDto, Income } from "../interfaces";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import type { ShopCashRegister } from "@/lib/types/shop";
import type { IncomeFormValues } from "../components/income-form/income-form";

interface UseIncomeParams {
  isOwner: boolean;
  activeShopId?: string | null;
}

export const useIncome = ({ isOwner, activeShopId }: UseIncomeParams) => {
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
  const { activeShop } = useShopStore();

  const { incomes, pagination, incomesLoading, isFetching } = useIncomes(
    debouncedSearch,
    page,
    limit,
    isOwner && Boolean(activeShopId),
    startDate || undefined,
    endDate || undefined,
  );

  const { createMutation, updateMutation, deleteMutation } =
    useIncomeMutations();

  const openCashRegister = useMemo<ShopCashRegister | null>(() => {
    const list = activeShop?.openCashRegisters;
    if (Array.isArray(list)) {
      return (
        list.find((item) => item.status === "OPEN" || item.isOpen === true) ??
        list[0] ??
        null
      );
    }
    return null;
  }, [activeShop]);

  const openCashLoading = false;
  const openCashFetching = false;

  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Income | null>(null);

  const deletingId = useMemo(
    () =>
      deleteMutation.isPending && deleteMutation.variables
        ? (deleteMutation.variables as string)
        : null,
    [deleteMutation.isPending, deleteMutation.variables],
  );

  const handleSubmit = (values: IncomeFormValues) => {
    if (!activeShopId) {
      toast.error("Selecciona una tienda para gestionar ingresos.");
      return;
    }

    const amountValue = Number(values.amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      toast.error("El monto debe ser mayor a 0.");
      return;
    }

    if (!values.paymentMethodId) {
      toast.error("Selecciona un método de pago.");
      return;
    }

    if (!openCashRegister?.id) {
      toast.error("Necesitas una caja abierta para registrar ingresos.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const payload: CreateIncomeDto = {
      description: values.description.trim(),
      amount: amountValue,
      date: values.date?.trim() || today,
      paymentMethodId: values.paymentMethodId.trim(),
      shopId: activeShopId,
      cashRegisterId: openCashRegister.id,
    };

    if (editingIncome) {
      updateMutation.mutate(
        { id: editingIncome.id, payload },
        {
          onSuccess: () => {
            setEditingIncome(null);
            setIsModalOpen(false);
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setEditingIncome(null);
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleOpenCreate = () => {
    setEditingIncome(null);
    setIsModalOpen(true);
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setIsModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingIncome(null);
    setIsModalOpen(false);
  };

  const handleDelete = (income: Income) => setDeleteTarget(income);
  const closeDeleteModal = () => setDeleteTarget(null);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        if (editingIncome?.id === deleteTarget.id) {
          setEditingIncome(null);
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
    incomes,
    incomesLoading,
    isFetching,
    isModalOpen,
    editingIncome,
    deleteTarget,
    deletingId,
    handleSubmit,
    handleOpenCreate,
    handleEdit,
    handleCancelEdit,
    handleDelete,
    closeDeleteModal,
    confirmDelete,
    createMutation,
    updateMutation,
    deleteMutation,
    openCashLoading,
    openCashFetching,
  };
};

