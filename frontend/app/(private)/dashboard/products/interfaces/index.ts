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
  shopName: string;
  productId?: string;
  shopProductId?: string;
  finalSalePrice?: number;
  price?: number;
  categoryId?: string;
  categoryName?: string;
  supplierName?: string;
  taxRate: boolean | null;
  taxCategory: boolean | null;
  isActive: boolean;
  currency: string;
  measurementUnitId?: string;
  measurementUnit?: ProductMeasurementUnit | null;
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
  categoryId?: string;
  isActive?: boolean;
  measurementUnitId: string;
}

export interface CreateProductResponse {
  message: string;
  data: {
    product: Product;
    shopProduct: ShopProduct;
  };
}

export interface ShopProduct {
  id: string;
  shopId: string;
  productId: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  createdAt: Date;
  createdBy: string;
  currency: string;
  isActive: boolean;
  finalSalePrice: number;
  supplier: null;
}

export interface ProductMeasurementUnit {
  id: string;
  name: string;
  code: string;
  category: string;
  baseUnit: string;
  conversionFactor: number;
  isBaseUnit: boolean;
  isDefault: boolean;
}
