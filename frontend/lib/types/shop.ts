export interface Shop {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShopDetail extends Shop {
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
}

export interface CreateShopDto {
  name: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UpdateShopDto {
  name?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}
