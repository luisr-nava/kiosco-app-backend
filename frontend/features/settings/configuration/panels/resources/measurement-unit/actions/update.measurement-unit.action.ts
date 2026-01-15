import { kioscoApi } from "@/lib/kioscoApi";
import type { MeasurementUnit, UpdateMeasurementUnitDto } from "../types";

export const updateMeasurementUnitAction = async (
  id: string,
  payload: UpdateMeasurementUnitDto
): Promise<MeasurementUnit> => {
  const { data } = await kioscoApi.put<MeasurementUnit>(
    `/measurement-units/${id}`,
    payload
  );

  return data;
};
