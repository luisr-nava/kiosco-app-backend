import { useAnalyticsQuery } from "./useAnalitycsQuery";

export const useAnalitycs = () => {
  const { analytics, analyticsLoading, refetch } = useAnalyticsQuery();
  console.log(analytics);

  return {
    analytics,
    analyticsLoading,
    refetch,
  };
};

