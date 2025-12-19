export interface PaymentMethod {
  id: string;
  shopId: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePaymentMethodDto {
  shopId: string;
  name: string;
  code: string;
  description?: string | null;
}

export interface GetPaymentMethodsResponse {
  message?: string;
  data: PaymentMethod[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
