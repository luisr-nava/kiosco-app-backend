"use client";

import { usePaymentMethods } from "@/app/(protected)/settings/payment-method/hooks";
import { Loading } from "@/components/loading";
import { OpenCashRegisterModal } from "@/features/cash-register/components";
import { useCashRegisterStateQuery } from "@/features/cash-register/hooks";
import { IncomeHeader } from "@/features/incomes/components";
import ModalIncome from "@/features/incomes/components/modal-income";
import TableIncome from "@/features/incomes/components/table-income";
import { useIncomeModals, useIncomes } from "@/features/incomes/hooks";
import { useShopStore } from "@/features/shop/shop.store";
import { usePaginationParams } from "@/src/hooks/usePaginationParams";
import { useState } from "react";

export default function IncomesPage() {
  const { openCreate, openEdit, openDelete } = useIncomeModals();
  const { search, setSearch, debouncedSearch, page, limit, setPage, setLimit } =
    usePaginationParams(300);
  const { activeShopId } = useShopStore();
  const { incomes, incomesLoading, pagination, isFetching } = useIncomes(
    debouncedSearch,
    page,
    limit
  );
  const { paymentMethods } = usePaymentMethods();

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

  return (
    <div className="space-y-4">
      <IncomeHeader handleOpenCreate={handleCreateExpense} search={search} setSearch={setSearch} />
      {incomesLoading ? (
        <Loading />
      ) : (
        <div className="space-y-4 p-5">
          <TableIncome
            incomes={incomes}
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
      <ModalIncome />
      <OpenCashRegisterModal
        open={openCashModal}
        onOpenChange={setOpenCashRegisterModal}
        shopId={activeShopId!}
      />
    </div>
  );
}
