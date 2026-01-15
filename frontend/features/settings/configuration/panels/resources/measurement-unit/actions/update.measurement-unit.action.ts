import { kioscoApi } from "@/lib/kioscoApi";
import type { MeasurementUnit, UpdateMeasurementUnitDto } from "../types";

type MeasurementUnitResponse = MeasurementUnit | { data: MeasurementUnit };

const unwrapMeasurementUnit = (
  response: MeasurementUnitResponse
): MeasurementUnit => {
  if ("data" in response) {
    return response.data;
  }
  return response;
};

export const updateMeasurementUnitAction = async (
  id: string,
  payload: UpdateMeasurementUnitDto
): Promise<MeasurementUnit> => {
  const { data } = await kioscoApi.put<MeasurementUnitResponse>(
    `/measurement-units/${id}`,
    payload
  );

  return unwrapMeasurementUnit(data);
};
