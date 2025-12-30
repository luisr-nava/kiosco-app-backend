export interface ShopResponse {
  data: Shop[];
  message: string;
  role: string;
}
export interface Shop {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  countryCode: string;
  currencyCode: string;
  timezone: string;
}

import type { ShopAnalytics } from "@/lib/types/analytics";

export interface ShopDetail extends Shop {
  hasOpenCashRegister: boolean;
  openCashRegisters?: ShopCashRegister[];
  taxIdNumber: string | null;
  taxCondition: string | null;
  taxAddress: string | null;
  employees: unknown[];
  employeesCount: number;
  productsCount: number;
  categoriesCount: number;
  purchasesCount: number;
  salesCount: number;
  suppliersCount: number;
  totalSales: number;
  totalExpenses: number;
  totalIncomes: number;
  salesTransactions: number;
  expensesTransactions: number;
  incomesTransactions: number;
  balance: number;
  recentPurchases: unknown[];
  lowStockProducts: unknown[];
  topProductsByStock: unknown[];
  analytics?: ShopAnalytics;
}

export interface ShopCashRegister {
  id: string;
  shopId: string;
  status?: string;
  isOpen?: boolean;
  openingAmount?: number;
  openedAt?: string;
  openedBy?: string | null;
  closingAmount?: number | null;
  actualAmount?: number | null;
  difference?: number | null;
  closedAt?: string | null;
  closedBy?: string | null;
  closingNotes?: string | null;
}

export interface ShopFormValues {
  name: string;
  address?: string;
  phone?: string;
  countryCode: string;
  currencyCode: string;
  isActive?: boolean;
}

export interface UpdateShopDto {
  name?: string;
  address?: string;
  phone?: string;
  countryCode?: string;
  currencyCode?: string;
  isActive?: boolean;
}

export interface ShopState {
  shops: Shop[];
  activeShopId: string | null;
  shouldForceStoreSelection: boolean;
  setShops: (shops: Shop[]) => void;
  setActiveShopId: (shopId: string) => void;
  setShouldForceStoreSelection: (force: boolean) => void;
  clearShops: () => void;
}


