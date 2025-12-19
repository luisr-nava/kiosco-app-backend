import { useExpenseQuery } from "./useExpenseQuery";

export const useExpenses = (
  search: string,
  page: number,
  limit: number = 10,
  enabled: boolean = true,
  startDate?: string,
  endDate?: string,
) => {
  const { expenses, pagination, expensesLoading, isFetching, refetch } =
    useExpenseQuery({ search, page, limit, enabled, startDate, endDate });

  return {
    expenses,
    pagination,
    expensesLoading,
    isFetching,
    refetch,
  };
};
