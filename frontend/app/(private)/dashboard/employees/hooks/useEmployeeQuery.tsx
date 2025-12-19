import { useQuery } from "@tanstack/react-query";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import { getEmployeesAction } from "../actions";

interface UseEmployeeQueryParams {
  search: string;
  page: number;
  limit?: number;
  enabled?: boolean;
}

export const useEmployeeQuery = ({
  search,
  page,
  limit = 10,
  enabled = true,
}: UseEmployeeQueryParams) => {
  const { activeShopId } = useShopStore();

  const query = useQuery({
    queryKey: ["employees", activeShopId, search, page, limit],
    queryFn: () =>
      getEmployeesAction(activeShopId!, {
        search,
        limit,
        page,
      }),
    enabled: enabled && Boolean(activeShopId),
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

