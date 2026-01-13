import { kioscoApi } from "@/lib/kioscoApi";
import type {
  GetMeasurementUnitsResponse,
  MeasurementUnit,
} from "../interfaces";

export const getMeasurementUnitsAction = async (
  shopId: string
): Promise<MeasurementUnit[]> => {
  const { data } = await kioscoApi.get<GetMeasurementUnitsResponse>(
    "/measurement-units",
    {
      params: { shopId },
    }
  );

  return data.data;
};
