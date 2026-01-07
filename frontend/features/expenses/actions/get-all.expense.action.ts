import { kioscoApi } from "@/lib/kioscoApi";
import type { Expense, GetExpensesResponse } from "../types";
import { Pagination } from "@/src/types";

export const getExpensesAction = async (
  shopId: string,
  params: {
    search?: string;
    limit?: number;
    page?: number;
  }
): Promise<{ expenses: Expense[]; pagination: Pagination }> => {
  const { data } = await kioscoApi.get<GetExpensesResponse>("/expense", {
    params: {
      shopId,
      search: params.search,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    },
  });

  return {
    expenses: data.data,
    pagination: data.meta,
  };
};
