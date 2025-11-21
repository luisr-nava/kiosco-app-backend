export interface PurchaseItem {
  id?: string;
  shopProductId: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
  includesTax: boolean;
  productName?: string;
}

export interface Purchase {
  id: string;
  shopId: string;
  supplierId?: string | null;
  notes?: string | null;
  total: number;
  items: PurchaseItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePurchaseDto {
  shopId: string;
  supplierId?: string | null;
  notes?: string | null;
  items: Array<{
    shopProductId: string;
    quantity: number;
    unitCost: number;
    subtotal: number;
    includesTax: boolean;
  }>;
}
