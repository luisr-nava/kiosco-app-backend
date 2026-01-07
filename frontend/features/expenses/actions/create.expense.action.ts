import { kioscoApi } from "@/lib/kioscoApi";
import type { CreateExpenseDto, Expense } from "../types";

export const createExpenseAction = async (payload: CreateExpenseDto): Promise<Expense> => {
  const { data } = await kioscoApi.post<Expense>("/expense", payload);
  return data;
};
