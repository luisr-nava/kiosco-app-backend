import { kioscoApi } from "@/lib/kioscoApi";
import type { CreateMeasurementUnitDto, MeasurementUnit } from "../types";

export const createMeasurementUnitAction = async (
  payload: CreateMeasurementUnitDto
): Promise<MeasurementUnit> => {
  const { data } = await kioscoApi.post<MeasurementUnit>(
    "/measurement-units",
    payload
  );

  return data;
};
