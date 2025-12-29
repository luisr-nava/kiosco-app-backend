export type AnalyticsMetricKey = "sales" | "purchases" | "incomes" | "expenses";
export type AnalyticsPeriod = "week" | "month" | "year" | "range";

export interface AnalyticsSeriesPoint {
  label: string;
  value: number;
}

export interface Metric {
  series: AnalyticsSeriesPoint[];
  total: number;
}

export interface AnalyticsRange {
  from: string;
  to: string;
}

export interface AnalyticsResponse {
  period: AnalyticsPeriod;
  range: AnalyticsRange;
  metrics: Partial<Record<AnalyticsMetricKey, Metric>>;
}

export interface TopProduct {
  shopProductId?: string;
  productId?: string;
  name?: string;
  quantitySold?: number;
  totalAmount?: number;
}

export type BestSaleRole = "OWNER" | "MANAGER" | "EMPLOYEE";

export interface BestSale {
  saleId?: string;
  total?: number;
  date?: string;
  performedBy?: {
    id?: string;
    fullName?: string | null;
    role?: BestSaleRole;
  };
}

export interface ShopAnalytics {
  sales?: Metric[];
  purchases?: Metric[];
  incomes?: Metric[];
  expenses?: Metric[];
  topProducts?: TopProduct[];
  bestSale?: BestSale;
  [key: string]: unknown;
}
