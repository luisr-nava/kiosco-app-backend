import { kioscoApi } from "@/lib/kioscoApi";

export const deleteIncomeAction = async (id: string): Promise<void> => {
  await kioscoApi.delete(`/income/${id}`);
};
