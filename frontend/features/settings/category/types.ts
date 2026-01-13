


export interface CreateCategorySupplierResponse {
  message: string;
  data: {
    categorySupplier: CategorySupplier;
  };
}

export interface CategorySupplier {
  id: string;
  name: string;
  isActive: boolean;
  shopId?: string;
  shopIds?: string[];
  shopName?: string;
  shopNames?: string[];
  createdAt: Date;
}

export interface CreateCategorySupplierDto {
  name: string;
  shopId?: string;
  shopIds?: string[];
}
