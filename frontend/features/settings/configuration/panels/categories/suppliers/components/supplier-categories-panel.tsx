import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks";
import { useShopQuery } from "@/features/shop/hooks/useShopQuery";
import { CategorySupplier } from "../types";
import CategorySupplierForm from "./supplier-form";
import CategorySupplierList from "./supplier-list";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategorySupplierForm, useCategorySuppliersQuery } from "../hooks";

export default function SupplierCategoriesPanel() {
  const {
    categorySuppliers,
    isLoadingCategory,
    hasMoreSupplierCategories,
    fetchNextSupplierCategories,
    isFetchingNextSupplierCategories,
  } = useCategorySuppliersQuery();

  const { user } = useAuth();
  const { shops } = useShopQuery();
  const [editingCategory, setEditingCategory] = useState<
    CategorySupplier | undefined
  >();

  const handleCancelEdit = () => {
    setEditingCategory(undefined);
  };

  const { form, onSubmit, isLoading, isEditing } = useCategorySupplierForm(
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
            <CardTitle className="pb-3">Categorias de proveedores</CardTitle>
            <CategorySupplierForm
              user={user}
              shops={shops}
              form={form}
              onSubmit={onSubmit}
              isEditing={isEditing}
              pending={isLoading}
              handleCancelEdit={handleCancelEdit}
            />
          </div>

          <CategorySupplierList
            items={categorySuppliers}
            loading={isLoadingCategory}
            isOwner={user?.role === "OWNER"}
            onEdit={(category) => setEditingCategory(category)}
            hasNextPage={hasMoreSupplierCategories}
            fetchNextPage={fetchNextSupplierCategories}
            isFetchingNextPage={isFetchingNextSupplierCategories}
          />
        </CardContent>
      )}
    </Card>
  );
}
