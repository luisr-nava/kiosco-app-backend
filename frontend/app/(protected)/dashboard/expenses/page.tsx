"use client";

import { useShopStore } from "@/features/shop/shop.store";
import { useCashRegisterStateQuery } from "@/features/cash-register/hooks/useCashRegisterStateQuery";
import {
  useExpenseColumns,
  ExpenseModal,
} from "@/features/expenses/components";
import { useExpenseModals, useExpenses } from "@/features/expenses/hooks";
import { usePaginationParams } from "@/src/hooks/usePaginationParams";
import { Loading } from "@/components/loading";
import { useState } from "react";
import { OpenCashRegisterModal } from "@/features/cash-register/components";
import { BaseHeader } from "@/components/header/BaseHeader";
import { Expense } from "../../../../features/expenses/types";
import { BaseTable } from "@/components/table/BaseTable";

export default function ExpensesPage() {
  const expenseModals = useExpenseModals();
  const {
    searchInput,
    debouncedSearch,
    page,
    limit,
    setSearch,
    setPage,
    setLimit,
    reset,
  } = usePaginationParams(500);
  const { expenses, expensesLoading, pagination, isFetching } = useExpenses(
    debouncedSearch,
    page,
    limit
  );

  const { activeShopId } = useShopStore();
  const { data } = useCashRegisterStateQuery(activeShopId!);

  const hasOpenCashRegister = data?.hasOpenCashRegister === true;
  const cashRegisterId = data?.cashRegisterId;
  const [openCashModal, setOpenCashRegisterModal] = useState(false);

  const handleCreateExpense = () => {
    if (!hasOpenCashRegister) {
      setOpenCashRegisterModal(true);
      return;
    }
    expenseModals.openCreate();
  };

  const columns = useExpenseColumns();

  return (
    <div className="space-y-4">
      <BaseHeader
        search={searchInput}
        setSearch={setSearch}
        onCreate={handleCreateExpense}
        createLabel="Nuevo egreso"
        showClearFilters={Boolean(searchInput)}
        onClearFilters={() => {
          reset();
          setSearch("");
        }}
      />
      {expensesLoading ? (
        <Loading />
      ) : (
        <BaseTable<Expense>
          data={expenses}
          getRowId={(e) => e.id}
          columns={columns}
          actions={(e) => [
            {
              type: "edit",
              onClick: expenseModals.openEdit,
            },
            {
              type: "delete",
              onClick: expenseModals.openDelete,
            },
          ]}
          pagination={{
            page,
            limit,
            totalPages: pagination?.totalPages || 0,
            totalItems: pagination?.total || 0,
            isFetching,
            onPageChange: setPage,
            onLimitChange: setLimit,
          }}
        />
      )}
      <ExpenseModal cashRegisterId={cashRegisterId!} modals={expenseModals} />
      <OpenCashRegisterModal
        open={openCashModal}
        onOpenChange={setOpenCashRegisterModal}
      />
    </div>
  );
}
