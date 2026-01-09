"use client";

import { BaseHeader } from "@/components/header/BaseHeader";
import { Loading } from "@/components/loading";
import { BaseTable } from "@/components/table/BaseTable";
import { useProductQuery, useProducts } from "@/features/products/hooks";
import {
  PurchaseModal,
  usePurchaseColumns,
} from "@/features/purchases/components";
import { usePurchaseModals, usePurchases } from "@/features/purchases/hooks";
import { Purchase } from "@/features/purchases/types";
import { useShopStore } from "@/features/shop/shop.store";
import { supplierApi } from "@/lib/api/supplier.api";
import { usePaginationParams } from "@/src/hooks/usePaginationParams";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function ComprasPage() {
  const { activeShopId } = useShopStore();

  const purchaseModals = usePurchaseModals();

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
  const { products } = useProductQuery();
  // ? TODO: Move to supplier hook
  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers", activeShopId, "for-products"],
    queryFn: () => supplierApi.listByShop(activeShopId || ""),

    enabled: Boolean(activeShopId),
    staleTime: 1000 * 30,
  });
  const { purchase, purchaseLoading, pagination, isFetching } = usePurchases({
    ...filters,
    search: debouncedSearch,
    page,
    limit,
  });
  const purchasesColums = usePurchaseColumns();
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
        createLabel={"Nueva compra"}
        // showClearFilters={hasActiveFilters}
        onClearFilters={() => {
          reset();
          // setFilters({});
          setSearch("");
        }}
        onCreate={purchaseModals.openCreate}
      />
      {purchaseLoading ? (
        <Loading />
      ) : (
        <BaseTable<Purchase>
          data={purchase}
          getRowId={(e) => e.id}
          columns={purchasesColums}
          actions={(e) => [
            {
              type: "edit",
              onClick: purchaseModals.openEdit,
            },
            {
              type: "delete",
              onClick: purchaseModals.openDelete,
            },
          ]}
          // renderExpandedContent={(e) => <ProductExpanded product={e} />}
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
      <PurchaseModal
        modals={purchaseModals}
        suppliers={suppliers}
        products={products}
      />
    </div>
  );
}
