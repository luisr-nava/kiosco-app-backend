import { kioscoApi } from "@/lib/kioscoApi";

export const deleteExpenseAction = async (id: string): Promise<void> => {
  await kioscoApi.delete(`/expense/${id}`);
};
