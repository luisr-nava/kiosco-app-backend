import { useIncomeQuery } from "./useIncomeQuery";

export const useIncomes = (
  search: string,
  page: number,
  limit: number = 10,
  enabled: boolean = true,
  startDate?: string,
  endDate?: string
) => {
  const { incomes, pagination, incomesLoading, isFetching, refetch } = useIncomeQuery({
    search,
    page,
    limit,
    enabled,
    startDate,
    endDate,
  });

  return { incomes, pagination, incomesLoading, isFetching, refetch };
};
