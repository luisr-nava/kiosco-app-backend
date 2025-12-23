import { useQuery } from "@tanstack/react-query";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import { getMeasurementUnitsAction } from "../actions";

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
