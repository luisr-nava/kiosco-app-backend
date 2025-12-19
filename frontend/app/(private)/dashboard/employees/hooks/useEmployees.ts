import { useEmployeeQuery } from "./useEmployeeQuery";

export const useEmployees = (
  search: string,
  page: number,
  limit: number = 10,
  enabled: boolean = true,
) => {
  const { employees, pagination, employeesLoading, isFetching, refetch } =
    useEmployeeQuery({ search, page, limit, enabled });

  return {
    employees,
    pagination,
    employeesLoading,
    isFetching,
    refetch,
  };
};
