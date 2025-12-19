import { kioscoApi } from "@/lib/kioscoApi";
import type { Expense, GetExpensesResponse } from "../interfaces";
import type { Pagination } from "@/app/(private)/interfaces";

type GetExpensesParams = {
  search?: string;
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
};

export const getExpensesAction = async (
  shopId: string,
  params: GetExpensesParams = {},
): Promise<{ expenses: Expense[]; pagination: Pagination }> => {
  const { data } = await kioscoApi.get<GetExpensesResponse>("/expense", {
    params: {
      shopId,
      search: params.search,
      limit: params.limit ?? 10,
      page: params.page ?? 1,
      startDate: params.startDate,
      endDate: params.endDate,
    },
  });

  return {
    expenses: data.data,
    pagination: data.meta,
  };
};
