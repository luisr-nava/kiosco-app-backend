export type CategoryType = "product" | "supplier";

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  type: CategoryType;
  shopId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string | null;
  type: CategoryType;
  shopId: string;
}
