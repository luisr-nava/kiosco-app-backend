import { useQuery } from "@tanstack/react-query";
import { getEmployeesAction } from "../actions";
import { useShopStore } from "@/features/shop/shop.store";

interface UseEmployeeQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const useEmployeeQuery = (params: UseEmployeeQueryParams) => {
  const { activeShopId } = useShopStore();

  const query = useQuery({
    queryKey: ["employees", activeShopId, params.page, params.limit, params.search ?? ""],
    queryFn: () =>
      getEmployeesAction(activeShopId!, {
        ...params,
      }),
    enabled: Boolean(activeShopId),
    staleTime: 1000 * 30,
    placeholderData: (prev) => prev,
  });

  const employees = query.data?.employees || [];
  const pagination = query.data?.pagination;

  return {
    employees,
    pagination,
    employeesLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};
