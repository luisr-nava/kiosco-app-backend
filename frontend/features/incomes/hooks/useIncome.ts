import { useIncomeQuery } from "./useIncomeQuery";

export const useIncomes = (
  search: string,
  page: number,
  limit: number = 10,
  enabled: boolean = true
) => {
  const { incomes, pagination, incomesLoading, isFetching, refetch } =
    useIncomeQuery({
      search,
      page,
      limit,
      enabled,
    });

  return { incomes, pagination, incomesLoading, isFetching, refetch };
};
