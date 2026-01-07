import { kioscoApi } from "@/lib/kioscoApi";
import { Summary, SummaryResponse } from "../types";

export const getAllSummaryAction = async (shopId: string): Promise<Summary> => {
  const { data } = await kioscoApi.get<SummaryResponse>(`shop/${shopId}/summary`);
  return data.data;
};
