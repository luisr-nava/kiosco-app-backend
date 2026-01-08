import { useCustomerQuery } from "./useCustomerQuery";

interface UseCustomerParams {
  search?: string;
  page: number;
  limit?: number;
  enabled?: boolean;
}

export const useCustomers = ({ ...params }: UseCustomerParams) => {
  const { customers, customersLoading, pagination, isFetching, refetch } =
    useCustomerQuery(params);

  return {
    customers,
    customersLoading,
    pagination,
    isFetching,
    refetch,
  };
};
