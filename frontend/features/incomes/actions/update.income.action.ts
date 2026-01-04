import { kioscoApi } from "@/lib/kioscoApi";
import type { CreateIncomeDto, Income } from "../interfaces";

export const updateIncomeAction = async (
  id: string,
  payload: Partial<CreateIncomeDto>,
): Promise<Income> => {
  const { data } = await kioscoApi.patch<Income>(`/income/${id}`, payload);
  return data;
};
