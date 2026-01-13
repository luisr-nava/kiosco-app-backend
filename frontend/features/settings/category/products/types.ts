export interface CategoryProduct {
  id: string;
  name: string;
  shopId: string;
  shopIds?: string[];
  shopName: string;
  productsCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface CategoryProductFormValues {
  name: string;
  isActive: boolean;
  shopId: string[];
}

export interface CreateCategoryProductDto {
  name: string;
  shopId?: string;
  shopIds: string[];
}
export interface CreateCategoryProductResponse {
  message: string;
  data: {
    categoryProduct: CategoryProduct;
  };
}