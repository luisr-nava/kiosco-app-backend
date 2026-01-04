import { kioscoApi } from "@/lib/kioscoApi";
import type { Income, GetIncomesResponse } from "../interfaces";
import type { Pagination } from "@/app/(protected)/interfaces";

type GetIncomesParams = {
  search?: string;
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
};

export const getIncomesAction = async (
  shopId: string,
  params: GetIncomesParams = {},
): Promise<{ incomes: Income[]; pagination: Pagination }> => {
  const { data } = await kioscoApi.get<GetIncomesResponse>("/income", {
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
    incomes: data.data,
    pagination: data.meta,
  };
};

