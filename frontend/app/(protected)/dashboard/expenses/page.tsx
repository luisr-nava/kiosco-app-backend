"use client";

import { usePaymentMethods } from "@/app/(protected)/settings/payment-method/hooks";
import { useShopStore } from "@/features/shop/shop.store";
import { useCashRegisterStateQuery } from "@/features/cash-register/hooks/useCashRegisterStateQuery";
import {
  ExpenseHeader,
  ModalExpense,
  TableExpense,
} from "@/features/expenses/components";
import { useExpenseModals, useExpenses } from "@/features/expenses/hooks";
import { usePaginationParams } from "@/src/hooks/usePaginationParams";
import { Loading } from "@/components/loading";
import { useState } from "react";
import { OpenCashRegisterModal } from "@/features/cash-register/components";

export default function ExpensesPage() {
  const { openCreate, openEdit, openDelete } = useExpenseModals();
  const { search, setSearch, debouncedSearch, page, limit, setPage, setLimit } =
    usePaginationParams(300);
  const { expenses, expensesLoading, pagination, isFetching } = useExpenses(
    debouncedSearch,
    page,
    limit,
  );

  const { activeShopId } = useShopStore();
  const { data } = useCashRegisterStateQuery(activeShopId!);
  const hasOpenCashRegister = data?.hasOpenCashRegister === true;
  const [openCashModal, setOpenCashRegisterModal] = useState(false);
  
  const handleCreateExpense = () => {
    if (!hasOpenCashRegister) {
      setOpenCashRegisterModal(true);
      return;
    }

    openCreate();
  };

  const {
    paymentMethods,
    isLoading: paymentMethodsLoading,
    isFetching: paymentMethodsFetching,
  } = usePaymentMethods();
  return (
    <div className="space-y-4">
      <ExpenseHeader
        handleOpenCreate={handleCreateExpense}
        search={search}
        setSearch={setSearch}
      />
      {expensesLoading ? (
        <Loading />
      ) : (
        <div className="p-5 space-y-4">
          <TableExpense
            expenses={expenses}
            handleEdit={openEdit}
            limit={limit}
            page={page}
            setLimit={setLimit}
            setPage={setPage}
            pagination={pagination!}
            isFetching={isFetching}
            paymentMethods={paymentMethods}
            handleDelete={openDelete}
          />
        </div>
      )}
      <ModalExpense />
      <OpenCashRegisterModal
        open={openCashModal}
        onOpenChange={setOpenCashRegisterModal}
        shopId={activeShopId!}
      />
    </div>
  );
}

