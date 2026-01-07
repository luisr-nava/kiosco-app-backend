export interface Income {
  id: string;
  shopId: string;
  amount: number;
  description: string;
  cashRegisterId?: string | null;
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

export interface CreateIncomeDto {
  description: string;
  amount: number;
  paymentMethodId: string;
  cashRegisterId: string;
  date: string;
  shopId: string;
}

export interface GetIncomesResponse {
  message?: string;
  data: Income[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalAmount?: number;
  };
}
