"use client";
import { useQuery } from "@tanstack/react-query";
import { useProducts } from "../../../../features/products/hooks/useProducts";
import { supplierApi } from "@/lib/api/supplier.api";
import { useMeasurementUnits } from "@/app/(protected)/settings/measurement-unit/hooks";
import { useShopStore } from "@/features/shop/shop.store";
import { usePaginationParams } from "@/src/hooks/usePaginationParams";
import { Loading } from "@/components/loading";
import { ModalProduct } from "@/features/products/components";
import { useProductModals } from "@/features/products/hooks/useProductModals";
import { BaseHeader } from "@/components/header/BaseHeader";
import { BaseTable } from "@/components/table/BaseTable";
import { productColumns } from "@/features/products/product.columns";
import { Product } from "@/features/products/types";
import { useState } from "react";
import { ProductFilters } from "@/features/products/components/product-filters";

export default function ProductsPage() {
  const { activeShopId } = useShopStore();

  const productsModals = useProductModals();
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

  const { products, productsLoading, pagination, isFetching } = useProducts({
    ...filters,
    search: debouncedSearch,
    page,
    limit,
  });

  // ? TODO: Move to supplier hook
  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers", activeShopId, "for-products"],
    queryFn: () => supplierApi.listByShop(activeShopId || ""),
    enabled: Boolean(activeShopId),
    staleTime: 1000 * 30,
  });
  const { measurementUnits, isLoading: measurementUnitsLoading } =
    useMeasurementUnits();

  const hasActiveFilters = Boolean(
    searchInput || filters.categoryId || filters.supplierId,
  );

  return (
    <div className="space-y-4">
      <BaseHeader
        search={searchInput}
        setSearch={setSearch}
        filters={
          <ProductFilters
            value={filters}
            onChange={(next) => {
              setFilters((prev) => ({ ...prev, ...next }));
              setPage(1);
            }}
            suppliers={suppliers}
          />
        }
        createLabel={"Nuevo producto"}
        showClearFilters={hasActiveFilters}
        onClearFilters={() => {
          reset();
          setFilters({});
          setSearch("");
        }}
        onCreate={productsModals.openCreate}
      />

      {productsLoading ? (
        <Loading />
      ) : (
        <BaseTable<Product>
          data={products}
          getRowId={(e) => e.id}
          columns={productColumns}
          actions={(e) => [
            {
              type: "edit",
              onClick: productsModals.openEdit,
            },
            // {
            //   type: "delete",
            //   onClick: productsModals.openEdit,
            // },
          ]}
          // renderExpandedContent={(e) => <EmployeeExpanded employee={e} />}
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
      <ModalProduct
        modals={productsModals}
        suppliers={suppliers}
        suppliersLoading={suppliersLoading}
        measurementUnits={measurementUnits}
        measurementUnitsLoading={measurementUnitsLoading}
      />
    </div>
  );
}

