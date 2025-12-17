import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/app/(auth)/hooks/useAuth";
import { useShallow } from "zustand/react/shallow";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import type { CategoryProduct, CategorySupplier } from "../interfaces";
import {
  useCategoryProductCreateMutation,
  useCategoryProductUpdateMutation,
  useCategorySupplierCreateMutation,
  useCategorySupplierUpdateMutation,
} from "./category.mutation";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";
import { AxiosError } from "axios";

type CategoryFormValues = {
  name: string;
  shopIds: string[];
  editingId?: string | null;
};

type CategoryType = "product" | "supplier";

export const useCategoryForm = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "OWNER";
  const { activeShopId, shops } = useShopStore(
    useShallow((state) => ({
      activeShopId: state.activeShopId,
      shops: state.shops,
    })),
  );

  const productCreateMutation = useCategoryProductCreateMutation();
  const supplierCreateMutation = useCategorySupplierCreateMutation();
  const productUpdateMutation = useCategoryProductUpdateMutation();
  const supplierUpdateMutation = useCategorySupplierUpdateMutation();

  const defaultShopIds = useMemo(
    () => (activeShopId ? [activeShopId] : []),
    [activeShopId],
  );

  const productForm = useForm<CategoryFormValues>({
    defaultValues: { name: "", shopIds: defaultShopIds, editingId: null },
  });
  const supplierForm = useForm<CategoryFormValues>({
    defaultValues: { name: "", shopIds: defaultShopIds, editingId: null },
  });

  const productEditing = productForm.watch("editingId");
  const supplierEditing = supplierForm.watch("editingId");

  useEffect(() => {
    if (!activeShopId) return;

    // Para roles no OWNER, forzar tienda activa
    if (!isOwner) {
      productForm.setValue("shopIds", [activeShopId], { shouldDirty: true });
      supplierForm.setValue("shopIds", [activeShopId], { shouldDirty: true });
      return;
    }

    // OWNER: si no está editando y la tienda activa no está en la selección, precargarla
    const productSelected = productForm.getValues("shopIds") || [];
    if (!productEditing && !productSelected.includes(activeShopId)) {
      productForm.setValue("shopIds", [activeShopId], { shouldDirty: true });
    }

    const supplierSelected = supplierForm.getValues("shopIds") || [];
    if (!supplierEditing && !supplierSelected.includes(activeShopId)) {
      supplierForm.setValue("shopIds", [activeShopId], { shouldDirty: true });
    }
  }, [
    isOwner,
    activeShopId,
    productForm,
    supplierForm,
    productEditing,
    supplierEditing,
  ]);

  const submitCategory = async (
    values: CategoryFormValues,
    type: CategoryType,
    editingId: string | null | undefined,
    resetFn: (vals?: CategoryFormValues) => void,
  ) => {
    const shopIds = isOwner
      ? values.shopIds
      : activeShopId
      ? [activeShopId]
      : [];
    if (!shopIds.length) return;
    const payload = {
      name: values.name,
      shopId: isOwner ? undefined : shopIds[0],
      shopIds,
    };

    if (editingId) {
      const mutation =
        type === "product" ? productUpdateMutation : supplierUpdateMutation;
      mutation.mutate(
        { id: editingId, payload },
        {
          onSuccess: () => {
            resetFn({ name: "", shopIds: defaultShopIds, editingId: null });
          },
          onError: (error: unknown) => {
            const { message } = getErrorMessage(
              error,
              "No se pudo actualizar la categoría",
            );
            toast.error("Error", { description: message });
          },
        },
      );
    } else {
      const mutation =
        type === "product" ? productCreateMutation : supplierCreateMutation;
      mutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Categoría creada");
          resetFn({ name: "", shopIds: defaultShopIds, editingId: null });
        },
        onError: (error: unknown) => {
          if (error instanceof AxiosError) {
            const message =
              error.response?.data?.message ?? "No se pudo crear la categoría";

            toast.error("Error", { description: message });
            return;
          }
          toast.error("Error", {
            description: "Ocurrió un error inesperado",
          });
        },
      });
    }
  };

  const onSubmitProduct = productForm.handleSubmit((values) =>
    submitCategory(values, "product", values.editingId, productForm.reset),
  );
  const onSubmitSupplier = supplierForm.handleSubmit((values) =>
    submitCategory(values, "supplier", values.editingId, supplierForm.reset),
  );

  const toggleShopSelection = (
    form: "product" | "supplier",
    shopId: string,
  ) => {
    const current =
      form === "product"
        ? productForm.watch("shopIds") || []
        : supplierForm.watch("shopIds") || [];
    const setter =
      form === "product" ? productForm.setValue : supplierForm.setValue;
    const next = current.includes(shopId)
      ? current.filter((id) => id !== shopId)
      : [...current, shopId];
    setter("shopIds", next);
  };

  const resolveCategoryShopIds = (category: {
    shopIds?: string[];
    shopId?: string;
  }) =>
    category.shopIds && category.shopIds.length > 0
      ? category.shopIds
      : category.shopId
      ? [category.shopId]
      : defaultShopIds;

  const handleEditProduct = (category: CategoryProduct) => {
    productForm.reset({
      name: category.name,
      shopIds: resolveCategoryShopIds(category),
      editingId: category.id,
    });
  };

  const handleEditSupplier = (category: CategorySupplier) => {
    supplierForm.reset({
      name: category.name,
      shopIds: resolveCategoryShopIds(category),
      editingId: category.id,
    });
  };

  const cancelProductEdit = () =>
    productForm.reset({ name: "", shopIds: defaultShopIds, editingId: null });
  const cancelSupplierEdit = () =>
    supplierForm.reset({ name: "", shopIds: defaultShopIds, editingId: null });

  const productShopIds = productForm.watch("shopIds") || [];
  const supplierShopIds = supplierForm.watch("shopIds") || [];

  const canCreateProduct =
    (productForm.watch("name") || "").trim().length >= 3 &&
    (isOwner ? productShopIds.length > 0 : Boolean(activeShopId));
  const canCreateSupplier =
    (supplierForm.watch("name") || "").trim().length >= 3 &&
    (isOwner ? supplierShopIds.length > 0 : Boolean(activeShopId));

  const productPending =
    productCreateMutation.isPending || productUpdateMutation.isPending;
  const supplierPending =
    supplierCreateMutation.isPending || supplierUpdateMutation.isPending;

  return {
    isOwner,
    shops,
    activeShopId,
    // forms
    productForm,
    supplierForm,
    registerProduct: productForm.register,
    registerSupplier: supplierForm.register,
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
    editingProductId: productForm.watch("editingId"),
    editingSupplierId: supplierForm.watch("editingId"),
    productPending,
    supplierPending,
  };
};

export type UseCategoryFormReturn = ReturnType<typeof useCategoryForm>;

