export interface SaleItem {
  id: string;
  saleId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  total: number;
  shopProduct: {
    id: string;
    salePrice: number;
    product: {
      id: string;
      name: string;
      description?: string | null;
      barcode?: string | null;
    };
  };
}

export interface Sale {
  id: string;
  shopId: string;
  totalAmount: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  paymentStatus: "PAID" | "PENDING" | "CANCELLED";
  status: "COMPLETED" | "CANCELLED";
  saleDate: string;
  notes?: string | null;
  createdAt: string;
  items: SaleItem[];
}

export interface GetAllSalesParams {
  shopId: string;
  page?: number;
  limit?: number;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export interface SaleResponse {
  data: Sale[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SaleHistory {
  id: string;
  shopId: string;
  totalAmount: number;
  saleDate: string;
  status: string;
  paymentStatus: string;
  items: SaleItem[];
  createdAt: string;
}
