import { useEffect } from "react";
import { useShopStore } from "@/app/(private)/store/shops.slice";
import { useShallow } from "zustand/react/shallow";
import {
  usePoductCreateMutation,
  useProductUpdateMutation,
} from "./product.mutation";
import { CreateProductDto, Product } from "../interfaces";
import { useForm } from "react-hook-form";
import { useModal } from "@/app/(private)/hooks/useModal";
const initialForm: CreateProductDto = {
  name: "",
  description: "",
  barcode: "",
  shopId: "",
  costPrice: 0,
  salePrice: 0,
  stock: 1,
  supplierId: "",
  isActive: true,
  measurementUnitId: "",
};

export const useProductForm = () => {
  const { activeShopId, activeShopLoading } = useShopStore(
    useShallow((state) => ({
      activeShopId: state.activeShopId,
      activeShopLoading: state.activeShopLoading,
    })),
  );
  const createMutation = usePoductCreateMutation();
  const updateMutation = useProductUpdateMutation();
  const productModal = useModal("createProduct");
  const editProductModal = useModal("editProduct");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    getValues,
    formState: { errors },
  } = useForm<CreateProductDto>({
      defaultValues: {
        ...initialForm,
        shopId: activeShopId || "",
      },
    });

  const onSubmit = handleSubmit((values) => {
    if (!activeShopId) return;

    const cost = Number(values.costPrice) || 0;
    const sale = Number(values.salePrice) || 0;
    const stock = Number(values.stock) || 0;

    const { isActive, ...restValues } = values;

    const basePayload: CreateProductDto = {
      ...restValues,
      shopId: activeShopId,
      supplierId: restValues.supplierId || undefined,
      costPrice: cost,
      salePrice: sale,
      stock,
      measurementUnitId: restValues.measurementUnitId,
    };

    if (editProductModal.isOpen && editProductModal.data) {
      updateMutation.mutate({
        id: editProductModal.data,
        payload: { ...basePayload, isActive },
      });
    } else {
      // En creación no enviamos isActive
      createMutation.mutate(basePayload);
    }
  });

  const handleEdit = (product: Product) => {
    reset({
      name: product.name,
      description: product.description || "",
      barcode: product.barcode || "",
      shopId: product.shopId,
      costPrice: product.costPrice ?? 0,
      salePrice: product.salePrice ?? 0,
      stock: product.stock ?? 0,
      supplierId: product.supplierId || "",
      isActive: product.isActive,
      measurementUnitId: product.measurementUnitId || product.measurementUnit?.id || "",
    });
    editProductModal.open(product.id);
  };
  const handleOpenCreate = () => {
    reset({
      ...initialForm,
      shopId: activeShopId || "",
    });
    productModal.open();
  };

  useEffect(() => {
    if (!createMutation.isSuccess) return;
    reset({
      ...initialForm,
      shopId: activeShopId || "",
    });
    productModal.close();
    editProductModal.close();
    createMutation.reset();
  }, [
    activeShopId,
    createMutation.isSuccess,
    createMutation.reset,
    editProductModal,
    productModal,
    reset,
  ]);

  useEffect(() => {
    if (!updateMutation.isSuccess) return;
    reset({
      ...initialForm,
      shopId: activeShopId || "",
    });
    productModal.close();
    editProductModal.close();
    updateMutation.reset();
  }, [
    activeShopId,
    updateMutation.isSuccess,
    updateMutation.reset,
    editProductModal,
    productModal,
    reset,
  ]);

  return {
    activeShopId,
    activeShopLoading,
    createMutation,
    updateMutation,
    register,
    onSubmit,
    reset,
    handleEdit,
    handleOpenCreate,
    productModal,
    editProductModal,
    initialForm,
    setValue,
    control,
    getValues,
    errors,
  };
};

export type UseProductFormReturn = ReturnType<typeof useProductForm>;
