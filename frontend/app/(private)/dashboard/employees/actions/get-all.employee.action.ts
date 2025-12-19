import { kioscoApi } from "@/lib/kioscoApi";
import type { Employee, GetEmployeesResponse } from "../interfaces";
import { unwrapResponse } from "@/lib/api/utils";
import type { Pagination } from "@/app/(private)/interfaces";

type GetEmployeesParams = {
  search?: string;
  limit?: number;
  page?: number;
};

const buildFallbackPagination = (
  total: number,
  page: number,
  limit: number,
): Pagination => {
  const safeLimit = limit || 10;
  const totalPages = Math.max(Math.ceil(total / safeLimit), 1);
  return {
    total,
    page,
    limit: safeLimit,
    totalPages,
  };
};

export const getEmployeesAction = async (
  shopId: string,
  params: GetEmployeesParams = {},
): Promise<{ employees: Employee[]; pagination: Pagination }> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const { data } = await kioscoApi.get<
    GetEmployeesResponse | Employee[] | { data: Employee[] }
  >("/employee", {
    params: {
      shopId,
      search: params.search,
      page,
      limit,
    },
  });

  // Respuesta estándar con meta + data
  if (typeof data === "object" && data && "meta" in data && "data" in data) {
    const response = data as GetEmployeesResponse;
    return {
      employees: response.data,
      pagination: response.meta,
    };
  }

  // Respuestas envolviendo data
  const unwrapped = unwrapResponse(data);
  if (Array.isArray(unwrapped)) {
    return {
      employees: unwrapped,
      pagination: buildFallbackPagination(unwrapped.length, page, limit),
    };
  }

  // Caso inesperado: devolver vacío con paginación segura
  return {
    employees: [],
    pagination: buildFallbackPagination(0, page, limit),
  };
};
