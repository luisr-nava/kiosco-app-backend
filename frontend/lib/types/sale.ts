export interface SaleItem {
  id?: string;
  shopProductId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  shopId: string;
  notes?: string | null;
  total: number;
  items: SaleItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSaleDto {
  shopId: string;
  notes?: string | null;
  items: Array<{
    shopProductId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
}
