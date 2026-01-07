import { useQuery } from "@tanstack/react-query";
import { getMeasurementUnitsAction } from "../actions";
import { useShopStore } from "@/features/shop/shop.store";

export const useMeasurementUnits = () => {
  const { activeShopId } = useShopStore();

  const query = useQuery({
    queryKey: ["measurement-units", activeShopId],
    queryFn: () => getMeasurementUnitsAction(activeShopId || ""),
    enabled: Boolean(activeShopId),
    staleTime: 1000 * 30,
    placeholderData: (prev) => prev,
  });

  return {
    measurementUnits: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
};
