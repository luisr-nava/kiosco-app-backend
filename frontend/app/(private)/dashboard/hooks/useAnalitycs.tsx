import { useAnalyticsQuery } from "./useAnalitycs.query";

export const useAnalitycs = () => {
  const { analytics, analyticsLoading, refetch } = useAnalyticsQuery();
  return {
    analytics,
    analyticsLoading,
    refetch,
  };
};
