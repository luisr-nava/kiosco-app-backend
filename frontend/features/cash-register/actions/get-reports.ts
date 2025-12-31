import { kioscoApi } from "@/lib/kioscoApi";
import { Pagination } from "@/src/types";
import {
  CashRegisterReport,
  CashRegisterReportsApiResponse,
  PeriodFilter,
} from "../type";
import { getTodayIsoDate } from "@/lib/date-utils";

interface Params {
  period: PeriodFilter;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  month?: string;
  year?: string;
}
export const getReportsAction = async (
  params: Params,
): Promise<{ reports: CashRegisterReport[]; message?: string }> => {
  const { period, date, dateFrom, dateTo, month, year } = params;

  if (!period) {
    throw new Error("Periodo de reporte es requerido");
  }

  const queryParams: Record<string, string> = { period };

  if (period === "day") {
    queryParams.date = date ?? getTodayIsoDate();
  }

  if (dateFrom) queryParams.dateFrom = dateFrom;
  if (dateTo) queryParams.dateTo = dateTo;

  if (period === "month" && month) {
    queryParams.month = month;
  }

  if ((period === "month" || period === "year") && year) {
    queryParams.year = year;
  }

  const { data } = await kioscoApi.get<CashRegisterReportsApiResponse>(
    `/cash-register/reports`,
    { params: queryParams },
  );

  const reports: CashRegisterReport[] = data.data.map((item) => ({
    id: item.cashRegisterId,
    shopName: item.shopName,
    openedAt: item.openedAt,
    closedAt: item.closedAt,
    openedByName: item.responsible,
    openingAmount: item.openingAmount,
    closingAmount: item.closingAmount,
    actualAmount: item.closingAmount,
    difference: item.difference,
    status: item.status,
  }));

  return {
    reports,
    message: data.message,
  };
};

