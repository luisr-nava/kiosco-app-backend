import { useSupplierQuery } from "./useSupplierQuery";

export const useSupplier = (
  search: string,
  page: number,
  limit: number = 10,
  enabled: boolean = true,
  startDate?: string,
  endDate?: string,
) => {
    const { suppliers, pagination, supplierLoading, isFetching, refetch } =
      useSupplierQuery({ search, page, limit, enabled, startDate, endDate });
  
    return {
      suppliers,
      pagination,
      supplierLoading,
      isFetching,
      refetch,
    };
};





