import { kioscoApi } from "@/lib/kioscoApi";
import type {
  CreateMeasurementUnitDto,
  MeasurementUnit,
} from "../interfaces";

export const createMeasurementUnitAction = async (
  payload: CreateMeasurementUnitDto,
): Promise<MeasurementUnit> => {
  const { data } = await kioscoApi.post<{ data: MeasurementUnit }>(
    "/measurement-units",
    payload,
  );

  return data.data;
};
