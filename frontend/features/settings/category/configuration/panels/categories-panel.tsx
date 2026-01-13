import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CategoryProductForm } from "../../products/components";
import { useCategoryForm } from "../../hooks";
import { useAuth } from "@/features/auth/hooks";
import { useShopQuery } from "@/features/shop/hooks/useShopQuery";
import { useCategoryProductsQuery } from "../../products/hooks";

export default function CategoriesPanel() {
  const {
    registerProduct,
    registerSupplier,
    onSubmitProduct,
    onSubmitSupplier,
    toggleShopSelection,
    handleEditProduct,
    handleEditSupplier,
    cancelProductEdit,
    cancelSupplierEdit,
    productShopIds,
    supplierShopIds,
    canCreateProduct,
    canCreateSupplier,
    editingProductId,
    editingSupplierId,
    // productPending,
    supplierPending,
  } = useCategoryForm();
  const { categoryProducts } = useCategoryProductsQuery();

  const { user } = useAuth();
  const { shops } = useShopQuery();
  return (
    <div>
      <Card>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <CardTitle className="pb-3">Categorias de productos</CardTitle>
            <CategoryProductForm
              user={user}
              shops={shops}
              registerName={registerProduct}
              selectedShopIds={productShopIds}
              onToggleShop={(id) => toggleShopSelection("product", id)}
              onSubmit={onSubmitProduct}
              canSubmit={canCreateProduct}
              isEditing={Boolean(editingProductId)}
              onCancelEdit={cancelProductEdit}
              pending={false}
            />
          </div>

          {/* <CategoryList
            title="Listado de categorías"
            icon={<Package className="text-primary h-5 w-5" />}
            items={categoryProducts}
            loading={categoryProductsLoading}
            emptyText="Aún no tienes categorías para productos."
            isOwner={isOwner}
            onEdit={handleEditProduct}
            hasNextPage={hasMoreProductCategories}
            fetchNextPage={fetchNextProductCategories}
            isFetchingNextPage={isFetchingNextProductCategories}
          /> */}
        </CardContent>
      </Card>
    </div>
  );
}
