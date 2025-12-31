export type PeriodFilter = "day" | "week" | "month" | "year";
export type CashRegisterReportPeriod = PeriodFilter;

export interface CashRegisterReport {
  id: string;
  shopName: string;
  openedAt: string;
  closedAt: string;
  openedByName: string;
  openingAmount: number;
  closingAmount: number;
  actualAmount: number;
  difference: number;
  status: "EXACTO" | "SOBRANTE" | "FALTANTE";
}

export interface CashRegisterReportApi {
  cashRegisterId: string;
  shopId: string;
  shopName: string;
  openedAt: string;
  closedAt: string;
  responsible: string;
  openingAmount: number;
  closingAmount: number;
  difference: number;
  status: "EXACTO" | "SOBRANTE" | "FALTANTE";
}

export interface CashRegisterReportsApiResponse {
  data: CashRegisterReportApi[];
  message?: string;
}
// //////////////
export interface CashRegisterReportsQueryParams {
  period: PeriodFilter;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  month?: string;
  year?: string;
  enabled?: boolean;
}

export interface UseCashRegisterReportsResult {
  reports: CashRegisterReport[];
  message?: string;
  isFetching: boolean;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

export type CashRegisterExportType = "pdf" | "excel";

