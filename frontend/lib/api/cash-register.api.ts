import { kioscoApi } from "@/lib/kioscoApi";
import { getTodayIsoDate } from "@/lib/date-utils";
import type {
  CashRegister,
  OpenCashRegisterDto,
} from "@/lib/types/cash-register";
import {
  CashRegisterReportsApiResponse,
  PeriodFilter,
} from "@/features/reports/type";

const CASH_REGISTER_BASE_PATH = "/cash-register";

export const cashRegisterApi = {
  // Verificar si hay una caja abierta para la tienda
  getOpenCashRegister: async (shopId: string) => {
    // Promise<CashRegister | null>
    if (!shopId) throw new Error("shopId es requerido");

    try {
      const { data } = await kioscoApi.get<
        CashRegister | { data: CashRegister } | null
      >(`${CASH_REGISTER_BASE_PATH}/open`, {
        params: { shopId },
      });
      const payload = data;
      return data ?? null;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Abrir caja
  openCashRegister: async (payload: OpenCashRegisterDto) => {
    // : Promise<CashRegister>
    if (!payload.shopId) {
      throw new Error("shopId es requerido");
    }

    try {
      const { data } = await kioscoApi.post<
        CashRegister | { data: CashRegister }
      >(`${CASH_REGISTER_BASE_PATH}/open`, payload, {
        params: { shopId: payload.shopId },
      });
      return { data };
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error("Caja no encontrada para la tienda seleccionada");
      }
      throw error;
    }
  },

  getReports: async (params: {
    period: PeriodFilter;
    date?: string;
    dateFrom?: string;
    dateTo?: string;
    month?: string;
    year?: string;
  }) => {
    // : Promise<{ reports: CashRegisterReport[]; message?: string }>
    const { period, date, dateFrom, dateTo, month, year } = params;

    if (!period) {
      throw new Error("Periodo de reporte es requerido");
    }

    const queryParams: Record<string, string> = { period };

    if (period === "day") {
      queryParams.date = date ?? getTodayIsoDate();
    }

    if (dateFrom) {
      queryParams.dateFrom = dateFrom;
    }

    if (dateTo) {
      queryParams.dateTo = dateTo;
    }

    if (period === "month" && month) {
      queryParams.month = month;
    }

    if ((period === "month" || period === "year") && year) {
      queryParams.year = year;
    }

    const { data } = await kioscoApi.get<CashRegisterReportsApiResponse>(
      `${CASH_REGISTER_BASE_PATH}/reports`,
      {
        params: queryParams,
      },
    );

    // const reports = unwrapResponse<CashRegisterReport[]>(data);
    const message = "message" in data ? data.message : undefined;

    return { data, message };
  },
};

