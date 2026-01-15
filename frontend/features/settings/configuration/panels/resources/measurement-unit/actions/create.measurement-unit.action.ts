import { kioscoApi } from "@/lib/kioscoApi";
import type { CreateMeasurementUnitDto, MeasurementUnit } from "../types";

type MeasurementUnitResponse = MeasurementUnit | { data: MeasurementUnit };

const unwrapMeasurementUnit = (
  response: MeasurementUnitResponse
): MeasurementUnit => {
  if ("data" in response) {
    return response.data;
  }
  return response;
};

export const createMeasurementUnitAction = async (
  payload: CreateMeasurementUnitDto
): Promise<MeasurementUnit> => {
  const { data } = await kioscoApi.post<MeasurementUnitResponse>(
    "/measurement-units",
    payload
  );

  return unwrapMeasurementUnit(data);
};
