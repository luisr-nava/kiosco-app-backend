export interface Expense {
  id: string;
  shopId: string;
  amount: number;
  description: string;
  cashRegisterId?: string | null;
  category?: string | null;
  date: string;
  paymentMethodId?: string | null;
  paymentMethod?: {
    id?: string;
    name?: string;
    code?: string;
  } | null;
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
  amount?: number;
  paymentMethodId: string;
  cashRegisterId: string;
  shopId: string;
  date: string | null;
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
