"use client";

import { BaseHeader } from "@/components/header/BaseHeader";
import { Loading } from "@/components/loading";
import { BaseTable } from "@/components/table/BaseTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSaleColumns } from "@/features/sales-history/components/sales.columns";
import { useSalesQuery } from "@/features/sales-history/hooks/useSalesHistoryQuery";
import { SaleHistory } from "@/features/sales-history/types";
import { Sale } from "@/features/sales/types";
import { usePaginationParams } from "@/src/hooks/usePaginationParams";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SalesHistoryPage() {
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
  const [filters, setFilters] = useState<{
    categoryId?: string;
    supplierId?: string;
  }>({});
  const { sales, isLoading, pagination } = useSalesQuery({
    ...filters,
    search: debouncedSearch,
    page,
    limit,
  });

  useEffect(() => {
    if (!pagination) return;

    if (page > pagination.totalPages && pagination.totalPages > 0) {
      setPage(pagination.totalPages);
    }
  }, [pagination?.totalPages, page]);

  const salesColums = useSaleColumns();
  const router = useRouter();
  return (
    <div className="space-y-4">
      <BaseHeader
        search={searchInput}
        setSearch={setSearch}
        // filters={
        //   <ProductFilters
        //     value={filters}
        //     onChange={(next) => {
        //       setFilters((prev) => ({ ...prev, ...next }));
        //       setPage(1);
        //     }}
        //     suppliers={suppliers}
        //   />
        // }
        // createLabel={"Nueva compra"}
        // showClearFilters={hasActiveFilters}
        onClearFilters={() => {
          reset();
          // setFilters({});
          setSearch("");
        }}
        // onCreate={() => {}}
      />
      {isLoading ? (
        <Loading />
      ) : (
        <BaseTable<SaleHistory>
          data={sales}
          getRowId={(e) => e.id}
          columns={salesColums}
          actions={(sale) => [
            {
              type: "edit",
              onClick: () => {
                router.push(`/dashboard/sales?editSaleId=${sale.id}`);
              },
            },
          ]}
          // renderExpandedContent={(e) => (
          // <PurchaseExpanded
          //   purchase={e}
          //   products={products}
          //   suppliers={suppliers}
          //   paymentMethods={paymentMethods}
          // />
          // )}
          pagination={{
            page,
            limit,
            totalPages: pagination?.totalPages || 0,
            totalItems: pagination?.total || 0,
            // isFetching,
            onPageChange: setPage,
            onLimitChange: setLimit,
          }}
        />
      )}
    </div>
  );
}
