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

export interface Summary {
  employeesCount: number;
  productsCount: number;
  categoriesCount: number;
  purchasesCount: number;
  salesCount: number;
  recentPurchasesLast30Days: number;
  totalSales: number;
  totalExpenses: number;
  totalIncomes: number;
  balance: number;
}
export interface SummaryResponse {
  message: string;
  data: Summary;
}
