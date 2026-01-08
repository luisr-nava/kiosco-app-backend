import { kioscoApi } from "@/lib/kioscoApi";
import { Pagination } from "@/app/(protected)/interfaces";
import { Customer, GetAllCustomerResponse } from "../types";

export const getAllCustomerAction = async (
  shopId: string,
  params: {
    search?: string;
    limit?: number;
    page?: number;
  }
): Promise<{
  customers: Customer[];
  pagination: Pagination;
}> => {
  const { data } = await kioscoApi.get<GetAllCustomerResponse>(
    `/customer/shop/${shopId}`,
    {
      params: {
        search: params.search,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      },
    }
  );

  return {
    customers: data.data,
    pagination: data.meta,
  };
};
