import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useCategoryProductForm, useCategoryProductsQuery } from "../hooks";
import { useAuth } from "@/features/auth/hooks";
import { useShopQuery } from "@/features/shop/hooks/useShopQuery";
import { CategoryProduct } from "../types";
import CategoryProductForm from "./product-form";
import CategoryProductList from "./product-list";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductCategoriesPanel() {
  const {
    categoryProducts,
    isLoadingCategory,
    hasMoreProductCategories,
    fetchNextProductCategories,
    isFetchingNextProductCategories,
  } = useCategoryProductsQuery();

  const { user } = useAuth();
  const { shops } = useShopQuery();
  const [editingCategory, setEditingCategory] = useState<
    CategoryProduct | undefined
  >();

  const handleCancelEdit = () => {
    setEditingCategory(undefined);
  };

  const { form, onSubmit, isLoading, isEditing } = useCategoryProductForm(
    editingCategory,
    handleCancelEdit
  );
  return (
    <Card>
      {isLoadingCategory ? (
        <div className="mx-10 grid gap-5">
          <Skeleton className="h-5 w-full rounded-full" />
          <Skeleton className="h-5 w-full rounded-full" />
          <Skeleton className="h-5 w-full rounded-full" />
        </div>
      ) : (
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <CardTitle className="pb-3">Categorias de productos</CardTitle>
            <CategoryProductForm
              user={user}
              shops={shops}
              form={form}
              onSubmit={onSubmit}
              isEditing={isEditing}
              pending={isLoading}
              handleCancelEdit={handleCancelEdit}
            />
          </div>

          <CategoryProductList
            items={categoryProducts}
            loading={isLoadingCategory}
            isOwner={user?.role === "OWNER"}
            onEdit={(category) => setEditingCategory(category)}
            hasNextPage={hasMoreProductCategories}
            fetchNextPage={fetchNextProductCategories}
            isFetchingNextPage={isFetchingNextProductCategories}
          />
        </CardContent>
      )}
    </Card>
  );
}
