"use client";

import { BaseHeader } from "@/components/header/BaseHeader";
import { Loading } from "@/components/loading";
import { BaseTable } from "@/components/table/BaseTable";
import { EmployeeExpanded, ModalEmployee } from "@/features/employees/components";
import { employeeColumns } from "@/features/employees/employee.columns";
import { useEmployeeModals, useEmployees } from "@/features/employees/hooks";
import { Employee } from "@/features/employees/types";
import { usePaginationParams } from "@/src/hooks/usePaginationParams";
import { useState } from "react";

export default function EmployeesPage() {
  const employeeModals = useEmployeeModals();
  const { searchInput, setSearch, debouncedSearch, page, limit, setPage, setLimit } =
    usePaginationParams(300);
  const [filters, setFilters] = useState<{
    categoryId?: string;
    supplierId?: string;
  }>({});
  const { employees, employeesLoading, pagination, isFetching } = useEmployees({
    ...filters,
    search: debouncedSearch,
    page,
    limit,
  });

  return (
    <div className="space-y-6">
      <BaseHeader
        search={searchInput}
        setSearch={setSearch}
        searchPlaceholder="Nombre o email"
        createLabel="Nuevo empleado"
        onCreate={employeeModals.openCreate}
      />
      {employeesLoading ? (
        <Loading />
      ) : (
        <BaseTable<Employee>
          data={employees}
          getRowId={(e) => e.id}
          columns={employeeColumns}
          actions={(e) => [
            {
              type: "edit",
              onClick: employeeModals.openEdit,
            },
          ]}
          renderExpandedContent={(e) => <EmployeeExpanded employee={e} />}
          pagination={{
            page,
            limit,
            totalPages: pagination!.totalPages,
            totalItems: pagination!.total,
            isFetching,
            onPageChange: setPage,
            onLimitChange: setLimit,
          }}
        />
      )}
      <ModalEmployee modals={employeeModals} />
    </div>
  );
}
