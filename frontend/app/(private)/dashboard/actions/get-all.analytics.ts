import { kioscoApi } from "@/lib/kioscoApi";
import { AnalyticsResponse } from "../interfaces";

type GetAnalyticsParams = {
  period: "week" | "month" | "year";
  month?: string;
  from?: string;
  to?: string;
};

export const getAllAnalyticsAction = async (
  shopId: string,
  params: GetAnalyticsParams,
): Promise<AnalyticsResponse> => {
  const { data } = await kioscoApi.get<AnalyticsResponse>(
    `/analytics?shopId=${shopId}`,
    {
      params: {
        period: params.period,
        month: params.month,
        from: params.from,
        to: params.to,
      },
    },
  );
  return data;
};

