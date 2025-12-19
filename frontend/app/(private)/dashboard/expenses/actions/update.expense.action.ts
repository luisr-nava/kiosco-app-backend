import { kioscoApi } from "@/lib/kioscoApi";
import type { CreateExpenseDto, Expense } from "../interfaces";

export const updateExpenseAction = async (
  id: string,
  payload: Partial<CreateExpenseDto>,
): Promise<Expense> => {
  const { data } = await kioscoApi.patch<Expense>(`/expense/${id}`, payload);
  return data;
};
