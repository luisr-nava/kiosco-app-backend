import { kioscoApi } from "@/lib/kioscoApi";

export const deleteMeasurementUnitAction = async (
  id: string,
): Promise<void> => {
  await kioscoApi.delete(`/measurement-units/${id}`);
};
