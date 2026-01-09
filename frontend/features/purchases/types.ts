export interface PurchaseItemDto {
  shopProductId: string;
  quantity?: number;
  unitCost?: number;
  subtotal: number;
}

export interface CreatePurchaseDto {
  shopId: string;
  supplierId?: string | null;
  notes?: string | null;
  paymentMethodId?: string;
  items: PurchaseItemDto[];
}

export interface UpdatePurchaseDto {
  supplierId?: string | null;
  notes?: string | null;
  items: PurchaseItemDto[]; // ⬅️ obligatorio en update
}

export interface Purchase {
  id: string;
  shopId: string;
  shopName?: string;
  supplierId?: string | null;
  notes?: string | null;
  total?: number;
  totalAmount?: number;
  itemsCount?: number;
  purchaseDate?: string;
  items: PurchaseItemDto[];
  createdAt?: string;
  updatedAt?: string;
  paymentMethodId?: string;
}

export interface PurchaseItemForm {
  shopProductId: string;
  quantity?: number | undefined;
  unitCost?: number | undefined;
  subtotal: number;
}

export interface CreatePurchaseForm {
  shopId: string;
  supplierId?: string | null;
  paymentMethodId?: string;
  notes?: string | null;
  items: PurchaseItemForm[];
}

export interface PurchaseQueryParams {
  search?: string;
  limit?: number;
  page?: number;
}

export interface GetAllPurchaseResponse {
  message: string;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data: Purchase[];
}
export interface CreatePurchaseResponse {
  message: string;
  data: {
    purchase: Purchase;
  };
}

export interface DeletePurchaseResponse {
  deletionReason: string;
}
