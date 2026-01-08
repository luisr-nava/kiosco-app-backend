import { kioscoApi } from "@/lib/kioscoApi";
import { Employee, GetAllEmployeesResponse } from "../types";
import { Pagination } from "@/src/types";

export const getEmployeesAction = async (
  shopId: string,
  params: {
    search?: string;
    limit?: number;
    page?: number;
  }
): Promise<{
  employees: Employee[];
  pagination: Pagination;
}> => {
  const { data } = await kioscoApi.get<GetAllEmployeesResponse>(
    `/shops/${shopId}/employees`,
    {
      params: {
        search: params.search,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      },
    }
  );
  return {
    employees: data.data,
    pagination: data.meta,
  };
};
