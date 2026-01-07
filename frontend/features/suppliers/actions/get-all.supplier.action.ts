import { kioscoApi } from "@/lib/kioscoApi";
import { GetSuppliersResponse, Supplier } from "../types";
import { Pagination } from "@/src/types";

type GetSuppliersParams = {
  search?: string;
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
};
export const getSuppliersAction = async (
  shopId: string,
  params: GetSuppliersParams = {}
): Promise<{ suppliers: Supplier[]; pagination: Pagination }> => {
  const { data } = await kioscoApi.get<GetSuppliersResponse>("/supplier", {
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
    suppliers: data.data,
    pagination: data.meta,
  };
};
