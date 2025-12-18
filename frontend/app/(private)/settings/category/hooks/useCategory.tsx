import type { CategoryProduct } from "../interfaces";
import { useCategoryProductsQuery, useCategorySuppliersQuery } from "./";

const aggregateCategories = (categories: CategoryProduct[]) => {
  const map = new Map<
    string,
    CategoryProduct & { shopIds?: string[]; shopNames?: string[] }
  >();

  categories.forEach((cat) => {
    const key = cat.name.toLowerCase();
    const existing = map.get(key);

    if (existing) {
      existing.shopIds = [...(existing.shopIds || []), cat.shopId];
      existing.shopNames = [...(existing.shopNames || []), cat.shopName];
      return;
    }

    map.set(key, {
      ...cat,
      shopIds: [cat.shopId],
      shopNames: [cat.shopName],
    });
  });

  return Array.from(map.values());
};

export const useCategory = () => {
  const {
    categoryProducts,
    pagination,
    categoryProductsLoading,
    fetchNextProductCategories,
    hasMoreProductCategories,
    isFetchingNextProductCategories,
  } = useCategoryProductsQuery();

  const {
    categorySuppliers,
    categorySuppliersLoading,
    pagination: suppliersPagination,
    fetchNextSupplierCategories,
    hasMoreSupplierCategories,
    isFetchingNextSupplierCategories,
  } = useCategorySuppliersQuery();

  const aggregatedCategoryProducts = aggregateCategories(categoryProducts);

  return {
    categoryProducts: aggregatedCategoryProducts,
    pagination,
    categoryProductsLoading,
    categorySuppliers,
    categorySuppliersLoading,
    suppliersPagination,
    fetchNextProductCategories,
    hasMoreProductCategories,
    isFetchingNextProductCategories,
    fetchNextSupplierCategories,
    hasMoreSupplierCategories,
    isFetchingNextSupplierCategories,
  };
};

