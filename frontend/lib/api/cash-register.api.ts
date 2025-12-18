import { kioscoApi } from "@/lib/kioscoApi";
import { unwrapResponse } from "./utils";
import type { CashRegister, OpenCashRegisterDto } from "@/lib/types/cash-register";

const CASH_REGISTER_BASE_PATH = "/cash-register";

export const cashRegisterApi = {
  // Verificar si hay una caja abierta para la tienda
  getOpenCashRegister: async (shopId: string): Promise<CashRegister | null> => {
    if (!shopId) throw new Error("shopId es requerido");

    try {
      const { data } = await kioscoApi.get<CashRegister | { data: CashRegister } | null>(
        `${CASH_REGISTER_BASE_PATH}/open`,
        {
          params: { shopId },
        },
      );
      const payload = unwrapResponse(data);
      return payload ?? null;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Abrir caja
  openCashRegister: async (
    payload: OpenCashRegisterDto,
  ): Promise<CashRegister> => {
    const { data } = await kioscoApi.post<
      CashRegister | { data: CashRegister }
    >(`${CASH_REGISTER_BASE_PATH}/open`, payload);
    return unwrapResponse(data);
  },
};
