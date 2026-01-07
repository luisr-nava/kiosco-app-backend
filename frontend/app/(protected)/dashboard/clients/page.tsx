"use client";
import { usePaginationParams } from "@/src/hooks/usePaginationParams";
import { Loading } from "@/components/loading";
import { useCustomerModals, useCustomers } from "@/features/clients/hooks";
import { CustomerExpanded, CustomerModal, customersColumns } from "@/features/clients/components";
import { useState } from "react";
import { BaseHeader } from "@/components/header/BaseHeader";
import { Customer } from "../../../../features/clients/types";
import { BaseTable } from "@/components/table/BaseTable";

export default function ClientesPage() {
  const customerModals = useCustomerModals();
  const { searchInput, debouncedSearch, page, limit, setSearch, setPage, setLimit, reset } =
    usePaginationParams(500);

  const { customers, customersLoading, pagination, isFetching } = useCustomers({
    search: debouncedSearch,
    page,
    limit,
  });

  return (
    <div className="space-y-4">
      <BaseHeader
        search={searchInput}
        setSearch={setSearch}
        onCreate={customerModals.openCreate}
        createLabel="Nuevo cliente"
        showClearFilters={Boolean(searchInput)}
        onClearFilters={() => {
          reset();
          setSearch("");
        }}
      />
      {customersLoading ? (
        <Loading />
      ) : (
        <BaseTable<Customer>
          data={customers}
          getRowId={(e) => e.id}
          columns={customersColumns}
          actions={(e) => [
            {
              type: "edit",
              onClick: customerModals.openEdit,
            },
            {
              type: "delete",
              onClick: customerModals.openDelete,
            },
          ]}
          renderExpandedContent={(e) => <CustomerExpanded customer={e} />}
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

      <CustomerModal modals={customerModals} />
    </div>
  );
}
