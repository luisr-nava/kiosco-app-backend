export interface AnalyticsResponse {
  period: string;
  range: Range;
  metrics: Metrics;
  insights: Insights;
}

export interface Insights {
  topProducts: TopProduct[];
  bestSale?: BestSale;
}

export interface BestSale {
  saleId: string;
  date: Date;
  total: number;
  itemsCount: number;
  name: string | null;
}

export interface TopProduct {
  productId: string;
  name: string;
  quantity: number;
  totalAmount: number;
}

export interface Metrics {
  sales: Expenses;
  purchases: Expenses;
  incomes: Expenses;
  expenses: Expenses;
}

export interface Expenses {
  series: Series[];
  total: number;
}

export interface Series {
  label: Date;
  value: number;
}

export interface Range {
  from: Date;
  to: Date;
}

