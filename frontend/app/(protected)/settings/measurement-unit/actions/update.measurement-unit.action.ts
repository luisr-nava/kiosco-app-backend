import { kioscoApi } from "@/lib/kioscoApi";
import type { MeasurementUnit, UpdateMeasurementUnitDto } from "../interfaces";

export const updateMeasurementUnitAction = async (
  id: string,
  payload: UpdateMeasurementUnitDto
): Promise<MeasurementUnit> => {
  const { data } = await kioscoApi.put<{ data: MeasurementUnit }>(
    `/measurement-units/${id}`,
    payload
  );

  return data.data;
};
