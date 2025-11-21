export interface Product {
  id: string;
  name: string;
  description?: string;
  barcode?: string;
  shopId: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  supplierId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  barcode?: string;
  shopId: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  supplierId?: string | null;
}
