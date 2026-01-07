import { useAnalyticsQuery } from "./useAnalyticsQuery";
import { useSummaryQuery } from "./useSummaryQuery";

export const useSummary = () => {
  const { summary, summaryLoading, refetch } = useSummaryQuery();

  return {
    summary,
    summaryLoading,
    refetch,
  };
};
