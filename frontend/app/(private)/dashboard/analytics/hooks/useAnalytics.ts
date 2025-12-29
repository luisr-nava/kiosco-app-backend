"use client";

import { useQuery } from "@tanstack/react-query";
import { kioscoApi } from "@/lib/kioscoApi";
import type {
  AnalyticsMetricKey,
  AnalyticsPeriod,
  AnalyticsResponse,
  Metric,
} from "@/lib/types/analytics";

export interface UseAnalyticsParams {
  shopId?: string;
  metric: AnalyticsMetricKey;
  period: AnalyticsPeriod;
  from?: string;
  to?: string;
}

const buildQueryParams = (params: {
  shopId: string;
  metric: AnalyticsMetricKey;
  period: AnalyticsPeriod;
  from?: string;
  to?: string;
}) => {
  const searchParams = new URLSearchParams();
  searchParams.append("shopId", params.shopId);
  searchParams.append("metric", params.metric);
  searchParams.append("period", params.period);

  if (params.from) {
    searchParams.append("from", params.from);
  }
  if (params.to) {
    searchParams.append("to", params.to);
  }

  return searchParams.toString();
};

const fetchAnalytics = async (params: {
  shopId: string;
  metric: AnalyticsMetricKey;
  period: AnalyticsPeriod;
  from?: string;
  to?: string;
}) => {
  const queryString = buildQueryParams(params);
  const { data } = await kioscoApi.get<AnalyticsResponse>(
    `/analytics?${queryString}`,
  );
  return data;
};

const toIsoString = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};

export const useAnalytics = (params: UseAnalyticsParams) => {
  const { shopId, metric, period, from, to } = params;

  const normalizedFrom = toIsoString(from ?? null);
  const normalizedTo = toIsoString(to ?? null);
  const isRangeReady =
    period !== "range" || (normalizedFrom !== null && normalizedTo !== null);
  const enabled =
    Boolean(shopId) && Boolean(metric) && Boolean(period) && isRangeReady;

  const queryKey = [
    "analytics",
    shopId ?? "idle",
    metric,
    period,
    normalizedFrom,
    normalizedTo,
  ];

  const query = useQuery<AnalyticsResponse>({
    queryKey,
    enabled,
    queryFn: async () => {
      if (!shopId) {
        return {
          period: "week",
          range: { from: "", to: "" },
          metrics: {},
        };
      }

      return fetchAnalytics({
        shopId,
        metric,
        period,
        from: normalizedFrom ?? undefined,
        to: normalizedTo ?? undefined,
      });
    },
  });

  const metricData: Metric | undefined = query.data?.metrics?.[metric];

  return {
    ...query,
    metricData,
  };
};

