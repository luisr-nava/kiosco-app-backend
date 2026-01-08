"use client";

import { BaseHeader } from "@/components/header/BaseHeader";
import { Loading } from "@/components/loading";
import { BaseTable } from "@/components/table/BaseTable";
import { OpenCashRegisterModal } from "@/features/cash-register/components";
import { useCashRegisterStateQuery } from "@/features/cash-register/hooks";
import { useIncomeColumns } from "@/features/incomes/components";
import IncomeModal from "@/features/incomes/components/income-modal";
import { useIncomeModals, useIncomes } from "@/features/incomes/hooks";
import { Income } from "@/features/incomes/types";
import { useShopStore } from "@/features/shop/shop.store";
import { usePaginationParams } from "@/src/hooks/usePaginationParams";
import { useState } from "react";

export default function IncomesPage() {
  const incomeModals = useIncomeModals();
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

  const { incomes, incomesLoading, pagination, isFetching } = useIncomes(
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
    incomeModals.openCreate();
  };

  const columns = useIncomeColumns();

  return (
    <div className="space-y-4">
      <BaseHeader
        search={searchInput}
        setSearch={setSearch}
        onCreate={handleCreateExpense}
        createLabel="Nuevo ingreso"
        showClearFilters={Boolean(searchInput)}
        onClearFilters={() => {
          reset();
          setSearch("");
        }}
      />
      {incomesLoading ? (
        <Loading />
      ) : (
        <BaseTable<Income>
          data={incomes}
          getRowId={(e) => e.id}
          columns={columns}
          actions={(e) => [
            {
              type: "edit",
              onClick: incomeModals.openEdit,
            },
            {
              type: "delete",
              onClick: incomeModals.openDelete,
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
      <IncomeModal cashRegisterId={cashRegisterId!} modals={incomeModals} />
      <OpenCashRegisterModal
        open={openCashModal}
        onOpenChange={setOpenCashRegisterModal}
      />
    </div>
  );
}
