import { kioscoApi } from "@/lib/kioscoApi";
import type { GetMeasurementUnitsResponse, MeasurementUnit } from "../types";

type GetMensurementUnitParams = {
  shopId: string;
  page?: number;
  limit?: number;
};
export const getMeasurementUnitsAction = async (
  params: GetMensurementUnitParams
): Promise<{
  measurementUnits: MeasurementUnit[];
  pagination: GetMeasurementUnitsResponse["meta"];
}> => {
  const { data } = await kioscoApi.get<GetMeasurementUnitsResponse>(
    "/measurement-units",
    {
      params: {
        shopId: params.shopId,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
      },
    }
  );
  return {
    measurementUnits: data.data,
    pagination: data.meta,
  };
};
