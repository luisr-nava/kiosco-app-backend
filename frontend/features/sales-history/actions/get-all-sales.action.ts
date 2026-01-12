import { kioscoApi } from "@/lib/kioscoApi";
import { Sale, SaleResponse } from "../types";
import { Pagination } from "@/src/types";
export interface SaleQueryParams {
  search?: string;
  limit?: number;
  page?: number;
}
export const getAllSalesAction = async (
  shopId: string,
  params: SaleQueryParams
): Promise<{ sales: Sale[]; pagination: Pagination }> => {
  const { data } = await kioscoApi.get<SaleResponse>(`/sale/shop/${shopId}`, {
    params: {
      shopId,
      search: params.search,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    },
  });
  return {
    sales: data.data,
    pagination: data.meta,
  };
};
