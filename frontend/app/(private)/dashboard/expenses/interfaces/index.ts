export interface Expense {
  id: string;
  shopId: string;
  amount: number;
  description: string;
  category?: string | null;
  date: string;
  paymentMethodId?: string | null;
  createdBy?: string | null;
  shop?: {
    id: string;
    name: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExpenseDto {
  description: string;
  amount: number;
  shopId: string;
  paymentMethodId?: string | null;
  category?: string | null;
  date: string;
}

export interface GetExpensesResponse {
  message?: string;
  data: Expense[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalAmount?: number;
  };
}
