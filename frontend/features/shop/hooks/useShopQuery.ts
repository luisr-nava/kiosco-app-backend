import { useQuery } from "@tanstack/react-query";
import { getAllShops } from "../actions/get-all.shops.action";

export const useShopQuery = () => {
  const query = useQuery({
    queryKey: ["shops"],
    queryFn: async () => getAllShops(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const shops = query.data || [];
  return {
    shops,
    shopsLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
    retry: 1,
  };
};

