import { useEmployeeQuery } from "./useEmployeeQuery";
interface UseEmployeeParams {
  search?: string;
  page: number;
  limit?: number;
  enabled?: boolean;
}
export const useEmployees = ({ ...params }: UseEmployeeParams) => {
  const { employees, pagination, employeesLoading, isFetching, refetch } = useEmployeeQuery(params);

  return {
    employees,
    pagination,
    employeesLoading,
    isFetching,
    refetch,
  };
};
