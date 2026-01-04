import { kioscoApi } from "@/lib/kioscoApi";
import type { CreateIncomeDto, Income } from "../interfaces";

export const createIncomeAction = async (
  payload: CreateIncomeDto,
): Promise<Income> => {
  const { data } = await kioscoApi.post<Income>("/income", payload);
  return data;
};
