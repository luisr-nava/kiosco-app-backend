import { kioscoApi } from "@/lib/kioscoApi";
import type { CreateExpenseDto, Expense } from "../interfaces";

export const createExpenseAction = async (
  payload: CreateExpenseDto,
): Promise<Expense> => {
  const { data } = await kioscoApi.post<Expense>("/expense", payload);
  return data;
};
